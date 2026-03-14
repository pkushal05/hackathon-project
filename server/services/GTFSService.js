const axios = require("axios");
const GtfsRealtimeBindings = require("gtfs-realtime-bindings");

class GTFSService {
  static normalizeKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  /**
   * Fetch GTFS-Realtime vehicle positions from a feed URL
   */
  static async getVehiclePositions() {
    const feedUrl = process.env.GTFS_FEED_URL;
    if (!feedUrl) {
      return [];
    }

    try {
      const response = await axios.get(feedUrl, {
        responseType: "arraybuffer",
        timeout: 10000,
      });

      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(response.data),
      );

      const vehicles = [];
      for (const entity of feed.entity) {
        if (entity.vehicle && entity.vehicle.position) {
          vehicles.push({
            vehicleId: entity.vehicle.vehicle?.id || "",
            label: entity.vehicle.vehicle?.label || "",
            latitude: entity.vehicle.position.latitude,
            longitude: entity.vehicle.position.longitude,
            bearing: entity.vehicle.position.bearing || 0,
            speed: entity.vehicle.position.speed || 0,
            timestamp: entity.vehicle.timestamp
              ? new Date(Number(entity.vehicle.timestamp) * 1000)
              : new Date(),
            routeId: entity.vehicle.trip?.routeId || "",
            tripId: entity.vehicle.trip?.tripId || "",
          });
        }
      }

      return vehicles;
    } catch (error) {
      console.error("GTFS Feed Error:", error.message);
      return [];
    }
  }

  /**
   * Get vehicle positions joined with bus data and urgency scores
   */
  static async getEnrichedVehiclePositions() {
    const Bus = require("../models/Bus");
    const MaintenanceService = require("./MaintenanceService");
    const MaintenanceRecord = require("../models/MaintenanceRecord");

    const [vehicles, buses, records] = await Promise.all([
      GTFSService.getVehiclePositions(),
      Bus.find().lean(),
      MaintenanceRecord.find().lean(),
    ]);

    const busLookup = new Map();
    for (const bus of buses) {
      const aliasKey = GTFSService.normalizeKey(bus.alias);
      const busNumberKey = GTFSService.normalizeKey(bus.busNumber);

      if (aliasKey) {
        busLookup.set(aliasKey, bus);
      }
      if (busNumberKey) {
        busLookup.set(busNumberKey, bus);
      }
    }

    const recordsByAlias = new Map();
    for (const record of records) {
      const aliasKey = GTFSService.normalizeKey(record.busAlias);
      if (!aliasKey) continue;
      if (!recordsByAlias.has(aliasKey)) {
        recordsByAlias.set(aliasKey, []);
      }
      recordsByAlias.get(aliasKey).push(record);
    }

    const scoreCache = new Map();
    async function getRecordScore(record) {
      const key = String(
        record._id ||
          `${record.busAlias}_${record.pmNumber}_${record.reportDate}`,
      );
      if (!scoreCache.has(key)) {
        scoreCache.set(key, MaintenanceService.calculateUrgencyScore(record));
      }
      return scoreCache.get(key);
    }

    const enriched = await Promise.all(
      vehicles.map(async (v) => {
        const candidateKeys = [
          GTFSService.normalizeKey(v.label),
          GTFSService.normalizeKey(v.vehicleId),
        ].filter(Boolean);

        let bus = null;
        for (const key of candidateKeys) {
          if (busLookup.has(key)) {
            bus = busLookup.get(key);
            break;
          }
        }

        // If GTFS label/vehicleId doesn't map, keep the marker but mark as unknown.
        if (!bus) {
          return {
            ...v,
            bus: null,
            urgencyScore: 0,
            urgencyColor: "#eab308",
            urgencyLevel: "unknown",
            topMaintenanceRecord: null,
            maintenanceCount: 0,
          };
        }

        const busRecordCandidates = [
          ...(recordsByAlias.get(GTFSService.normalizeKey(bus.alias)) || []),
          ...(recordsByAlias.get(GTFSService.normalizeKey(bus.busNumber)) ||
            []),
          ...(recordsByAlias.get(GTFSService.normalizeKey(v.label)) || []),
        ];

        const uniqueMap = new Map();
        for (const record of busRecordCandidates) {
          uniqueMap.set(String(record._id), record);
        }
        const busRecords = Array.from(uniqueMap.values());

        let maxScore = 0;
        let topRecord = null;
        for (const r of busRecords) {
          const score = await getRecordScore(r);
          if (score > maxScore) {
            maxScore = score;
            topRecord = r;
          }
        }

        let urgencyScore = maxScore;
        if (!topRecord) {
          // Fallback from bus operating status when no maintenance history is linked.
          if (bus.status === "Maintenance") urgencyScore = 65;
          else if (bus.status === "Inactive") urgencyScore = 40;
          else if (bus.status === "Retired") urgencyScore = 85;
        }

        return {
          ...v,
          bus,
          urgencyScore,
          urgencyColor: MaintenanceService.getUrgencyColor(urgencyScore),
          urgencyLevel: MaintenanceService.getUrgencyLevel(urgencyScore),
          topMaintenanceRecord: topRecord,
          maintenanceCount: busRecords.length,
        };
      }),
    );

    return enriched;
  }
}

module.exports = GTFSService;
