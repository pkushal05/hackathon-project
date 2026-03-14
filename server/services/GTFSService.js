const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

class GTFSService {
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
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(response.data)
      );

      const vehicles = [];
      for (const entity of feed.entity) {
        if (entity.vehicle && entity.vehicle.position) {
          vehicles.push({
            vehicleId: entity.vehicle.vehicle?.id || '',
            label: entity.vehicle.vehicle?.label || '',
            latitude: entity.vehicle.position.latitude,
            longitude: entity.vehicle.position.longitude,
            bearing: entity.vehicle.position.bearing || 0,
            speed: entity.vehicle.position.speed || 0,
            timestamp: entity.vehicle.timestamp
              ? new Date(Number(entity.vehicle.timestamp) * 1000)
              : new Date(),
            routeId: entity.vehicle.trip?.routeId || '',
            tripId: entity.vehicle.trip?.tripId || '',
          });
        }
      }

      return vehicles;
    } catch (error) {
      console.error('GTFS Feed Error:', error.message);
      return [];
    }
  }

  /**
   * Get vehicle positions joined with bus data and urgency scores
   */
  static async getEnrichedVehiclePositions() {
    const Bus = require('../models/Bus');
    const MaintenanceService = require('./MaintenanceService');
    const MaintenanceRecord = require('../models/MaintenanceRecord');

    const [vehicles, buses] = await Promise.all([
      GTFSService.getVehiclePositions(),
      Bus.find().lean(),
    ]);

    const busMap = new Map();
    for (const bus of buses) {
      busMap.set(bus.alias, bus);
    }

    const enriched = await Promise.all(
      vehicles.map(async (v) => {
        const bus = busMap.get(v.label);
        if (!bus) return { ...v, bus: null, urgencyScore: 0, urgencyColor: '#22c55e' };

        // Get highest urgency record for this bus
        const records = await MaintenanceRecord.find({ busAlias: v.label }).lean();
        let maxScore = 0;
        let topRecord = null;
        for (const r of records) {
          const score = await MaintenanceService.calculateUrgencyScore(r);
          if (score > maxScore) {
            maxScore = score;
            topRecord = r;
          }
        }

        return {
          ...v,
          bus,
          urgencyScore: maxScore,
          urgencyColor: MaintenanceService.getUrgencyColor(maxScore),
          urgencyLevel: MaintenanceService.getUrgencyLevel(maxScore),
          topMaintenanceRecord: topRecord,
        };
      })
    );

    return enriched;
  }
}

module.exports = GTFSService;
