const MaintenanceRecord = require("../models/MaintenanceRecord");
const MaintenanceForecast = require("../models/MaintenanceForecast");
const PartsForecast = require("../models/PartsForecast");
const ServicePart = require("../models/ServicePart");
const Bus = require("../models/Bus");
const MaintenanceService = require("./MaintenanceService");

const PLANNED_MONTHLY_DISTANCE = 5000; // Default km/month — configurable

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeServiceType(value) {
  return normalizeText(value)
    .replace(/\bservice\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBusModel(value) {
  return normalizeText(value)
    .replace(/\bhev\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

class ForecastService {
  /**
   * Generate maintenance forecast for all records.
   * Predicts when each bus will need service based on avg daily km.
   */
  static async generateMaintenanceForecast() {
    const records = await MaintenanceRecord.find().lean();

    // Clear old forecasts
    await MaintenanceForecast.deleteMany({});

    const forecasts = [];
    const avgDailyKm = PLANNED_MONTHLY_DISTANCE / 30;

    for (const record of records) {
      if (record.unitsToGoKm <= 0 && record.daysLate <= 0) continue;

      const daysUntilService =
        record.unitsToGoKm > 0
          ? Math.round(record.unitsToGoKm / avgDailyKm)
          : 0;

      const urgencyScore =
        await MaintenanceService.calculateUrgencyScore(record);

      const windows = ["7", "14", "30"];
      for (const window of windows) {
        if (daysUntilService <= parseInt(window) || record.unitsLateKm > 0) {
          forecasts.push({
            busAlias: record.busAlias,
            serviceType: record.serviceType,
            urgencyScore,
            dueInDays: Math.max(daysUntilService, 0),
            dueDate: new Date(Date.now() + daysUntilService * 86400000),
            forecastWindow: window,
          });
        }
      }
    }

    if (forecasts.length > 0) {
      await MaintenanceForecast.insertMany(forecasts);
    }

    return forecasts;
  }

  /**
   * Generate parts forecast based on maintenance forecast.
   * For each predicted maintenance event → lookup serviceParts → aggregate.
   */
  static async generatePartsForecast() {
    const maintenanceForecasts = await MaintenanceForecast.find().lean();

    // Clear old parts forecasts
    await PartsForecast.deleteMany({});

    // Get bus manufacturer values for lookups
    const buses = await Bus.find().lean();
    const busModelMap = new Map();
    for (const bus of buses) {
      const aliasKey = String(bus.alias || "").trim();
      busModelMap.set(aliasKey, bus.manufacturer || "");
    }

    // Preload and index service-part rules by normalized keys.
    const servicePartRules = await ServicePart.find().lean();
    const servicePartMap = new Map();
    for (const rule of servicePartRules) {
      const key = `${normalizeServiceType(rule.serviceType)}|${normalizeBusModel(rule.busModel)}`;
      if (!servicePartMap.has(key)) {
        servicePartMap.set(key, []);
      }
      servicePartMap.get(key).push(rule);
    }

    // Aggregate parts by partNumber and window
    const partsMap = new Map();

    for (const forecast of maintenanceForecasts) {
      const aliasKey = String(forecast.busAlias || "").trim();
      const busModel = busModelMap.get(aliasKey) || "";
      const lookupKey = `${normalizeServiceType(forecast.serviceType)}|${normalizeBusModel(busModel)}`;
      const serviceParts = servicePartMap.get(lookupKey) || [];

      for (const sp of serviceParts) {
        const key = `${sp.partNumber}_${forecast.forecastWindow}`;
        if (partsMap.has(key)) {
          partsMap.get(key).quantity += sp.quantity;
        } else {
          partsMap.set(key, {
            partNumber: sp.partNumber,
            quantity: sp.quantity,
            forecastWindow: forecast.forecastWindow,
          });
        }
      }
    }

    const partForecasts = Array.from(partsMap.values());
    if (partForecasts.length > 0) {
      await PartsForecast.insertMany(partForecasts);
    }

    return partForecasts;
  }

  /**
   * Run full forecast pipeline (maintenance → parts)
   */
  static async runFullForecast() {
    const maintenanceForecasts =
      await ForecastService.generateMaintenanceForecast();
    const partsForecasts = await ForecastService.generatePartsForecast();
    return { maintenanceForecasts, partsForecasts };
  }
}

module.exports = ForecastService;
