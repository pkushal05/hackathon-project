const MaintenanceRecord = require('../models/MaintenanceRecord');
const ServiceType = require('../models/ServiceType');

class MaintenanceService {
  /**
   * Calculate urgency score for a maintenance record (0–100)
   */
  static async calculateUrgencyScore(record) {
    let score = 0;

    // Base score from overdue kilometers
    if (record.unitsLateKm > 0) {
      score += 70;
    }

    // Additional score from late kilometers (max 20)
    score += Math.min(record.unitsLateKm / 100, 20);

    // Score from days late (max 10)
    score += Math.min((record.daysLate || 0) * 1.2, 10);

    // Risk ratio from remaining distance
    if (record.frequencyKm > 0) {
      const ratio = record.unitsToGoKm / record.frequencyKm;
      if (ratio <= 0.05) {
        score += 15; // high risk
      } else if (ratio <= 0.1) {
        score += 10; // medium risk
      } else if (ratio <= 0.2) {
        score += 5;  // low risk
      }
    }

    // Apply severity weight from service type
    try {
      const serviceType = await ServiceType.findOne({ name: record.serviceType });
      if (serviceType && serviceType.severityWeight) {
        score *= (1 + (serviceType.severityWeight - 1) * 0.1);
      }
    } catch (e) {
      // Ignore lookup failures
    }

    // Normalize to 0–100
    return Math.min(Math.round(score), 100);
  }

  /**
   * Get urgency level label from score
   */
  static getUrgencyLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'healthy';
  }

  /**
   * Get urgency color for map markers
   */
  static getUrgencyColor(score) {
    if (score >= 80) return '#ef4444'; // red
    if (score >= 60) return '#f97316'; // orange
    if (score >= 40) return '#eab308'; // yellow
    return '#22c55e'; // green
  }

  /**
   * Get all records enriched with urgency scores
   */
  static async getRecordsWithUrgency() {
    const records = await MaintenanceRecord.find().lean();
    const enriched = await Promise.all(
      records.map(async (r) => ({
        ...r,
        urgencyScore: await MaintenanceService.calculateUrgencyScore(r),
      }))
    );
    return enriched.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }

  /**
   * Get fleet health summary
   */
  static async getFleetHealthSummary() {
    const records = await MaintenanceService.getRecordsWithUrgency();

    const busMap = new Map();
    for (const r of records) {
      const existing = busMap.get(r.busAlias);
      if (!existing || r.urgencyScore > existing.urgencyScore) {
        busMap.set(r.busAlias, r);
      }
    }

    let overdue = 0, dueSoon = 0, healthy = 0;
    for (const [, record] of busMap) {
      if (record.urgencyScore >= 70) overdue++;
      else if (record.urgencyScore >= 30) dueSoon++;
      else healthy++;
    }

    return {
      totalBuses: busMap.size,
      overdue,
      dueSoon,
      healthy,
    };
  }
}

module.exports = MaintenanceService;
