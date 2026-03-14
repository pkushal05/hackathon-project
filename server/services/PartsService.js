const ServicePart = require('../models/ServicePart');
const Part = require('../models/Part');

class PartsService {
  /**
   * Get parts required for a given service type and bus model
   */
  static async getPartsForService(serviceType, busModel) {
    const serviceParts = await ServicePart.find({ serviceType, busModel }).lean();
    const partNumbers = serviceParts.map(sp => sp.partNumber);
    const parts = await Part.find({ partNumber: { $in: partNumbers } }).lean();

    const partsMap = new Map();
    for (const p of parts) {
      partsMap.set(p.partNumber, p);
    }

    return serviceParts.map(sp => ({
      ...sp,
      partDetails: partsMap.get(sp.partNumber) || null,
    }));
  }

  /**
   * Get aggregated parts demand across all service types for a bus
   */
  static async getPartsDemandForBus(busAlias, busModel) {
    const MaintenanceRecord = require('../models/MaintenanceRecord');
    const records = await MaintenanceRecord.find({ busAlias }).lean();

    const allParts = [];
    for (const record of records) {
      const parts = await PartsService.getPartsForService(record.serviceType, busModel);
      allParts.push(...parts);
    }

    // Aggregate by part number
    const aggregated = new Map();
    for (const p of allParts) {
      if (aggregated.has(p.partNumber)) {
        aggregated.get(p.partNumber).quantity += p.quantity;
      } else {
        aggregated.set(p.partNumber, { ...p });
      }
    }

    return Array.from(aggregated.values());
  }
}

module.exports = PartsService;
