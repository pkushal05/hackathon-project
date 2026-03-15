const ForecastService = require("../services/ForecastService");
const MaintenanceService = require("../services/MaintenanceService");
const Bus = require("../models/Bus");
const MaintenanceForecast = require("../models/MaintenanceForecast");
const PartsForecast = require("../models/PartsForecast");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const DUE_SOON_WINDOW_DAYS = 14;

    const [buses, maintenanceForecasts, partsForecasts] = await Promise.all([
      Bus.find().select({ alias: 1 }).lean(),
      MaintenanceForecast.find().lean(),
      PartsForecast.find().lean(),
    ]);

    const busCount = buses.length;

    // Service distribution
    const serviceDistribution = {};
    for (const fc of maintenanceForecasts) {
      serviceDistribution[fc.serviceType] =
        (serviceDistribution[fc.serviceType] || 0) + 1;
    }

    const forecastByBus = new Map();
    for (const fc of maintenanceForecasts) {
      const busAlias = String(fc.busAlias || "").trim();
      if (!busAlias) continue;

      const dueInDays = Number(fc.dueInDays || 0);
      const current = forecastByBus.get(busAlias);

      if (
        !current ||
        Number(fc.urgencyScore || 0) > Number(current.urgencyScore || 0) ||
        dueInDays < current.dueInDays ||
        fc.forecastWindow === "7"
      ) {
        forecastByBus.set(busAlias, {
          busAlias,
          serviceType: fc.serviceType,
          dueInDays,
          urgencyScore: fc.urgencyScore || 0,
          forecastWindow: fc.forecastWindow,
        });
      }
    }

    let overdue = 0;
    let dueSoon = 0;
    let healthy = 0;
    const dueSoonBuses = [];

    for (const bus of buses) {
      const alias = String(bus.alias || "").trim();
      const bestForecast = forecastByBus.get(alias);

      if (!bestForecast) {
        healthy += 1;
        continue;
      }

      const urgencyLevel = MaintenanceService.getUrgencyLevel(
        Number(bestForecast.urgencyScore || 0),
      );

      if (urgencyLevel === "critical") {
        overdue += 1;
        continue;
      }

      if (
        bestForecast.dueInDays >= 0 &&
        bestForecast.dueInDays <= DUE_SOON_WINDOW_DAYS
      ) {
        dueSoon += 1;
        dueSoonBuses.push(bestForecast);
        continue;
      }

      healthy += 1;
    }

    dueSoonBuses.sort(
      (a, b) => a.dueInDays - b.dueInDays || b.urgencyScore - a.urgencyScore,
    );

    res.json({
      success: true,
      data: {
        totalBuses: busCount,
        overdue,
        dueSoon,
        healthy,
        dueSoonBuses,
        maintenanceForecasts: maintenanceForecasts.length,
        partsForecasts: partsForecasts.length,
        serviceDistribution,
        forecastTimeline: maintenanceForecasts
          .filter((f) => f.forecastWindow === "30")
          .slice(0, 20)
          .map((f) => ({
            busAlias: f.busAlias,
            serviceType: f.serviceType,
            dueInDays: f.dueInDays,
            urgencyScore: f.urgencyScore,
          })),
        partsDemand: partsForecasts
          .filter((f) => f.forecastWindow === "30")
          .slice(0, 15)
          .map((p) => ({ partNumber: p.partNumber, quantity: p.quantity })),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.generateForecasts = async (req, res, next) => {
  try {
    const result = await ForecastService.runFullForecast();
    res.json({
      success: true,
      data: {
        maintenanceCount: result.maintenanceForecasts.length,
        partsCount: result.partsForecasts.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
