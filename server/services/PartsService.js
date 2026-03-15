const ServicePart = require("../models/ServicePart");
const Part = require("../models/Part");

function normalizeQuantity(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric));
}

class PartsService {
  /**
   * Get parts required for a given service type and bus model
   */
  static async getPartsForService(serviceType, busModel) {
    const serviceParts = await ServicePart.find({
      serviceType,
      busModel,
    }).lean();
    const partNumbers = serviceParts.map((sp) => sp.partNumber);
    const parts = await Part.find({ partNumber: { $in: partNumbers } }).lean();

    const partsMap = new Map();
    for (const p of parts) {
      partsMap.set(p.partNumber, p);
    }

    return serviceParts.map((sp) => ({
      ...sp,
      partDetails: partsMap.get(sp.partNumber) || null,
    }));
  }

  /**
   * Get aggregated parts demand across all service types for a bus
   */
  static async getPartsDemandForBus(busAlias, busModel) {
    const MaintenanceRecord = require("../models/MaintenanceRecord");
    const records = await MaintenanceRecord.find({ busAlias }).lean();

    const allParts = [];
    for (const record of records) {
      const parts = await PartsService.getPartsForService(
        record.serviceType,
        busModel,
      );
      allParts.push(...parts);
    }

    // Aggregate by part number
    const aggregated = new Map();
    for (const p of allParts) {
      const quantity = normalizeQuantity(p.quantity);
      if (quantity <= 0) continue;

      if (aggregated.has(p.partNumber)) {
        aggregated.get(p.partNumber).quantity += quantity;
      } else {
        aggregated.set(p.partNumber, { ...p, quantity });
      }
    }

    return Array.from(aggregated.values());
  }
}

module.exports = PartsService;
