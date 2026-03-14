const ForecastService = require('../services/ForecastService');
const MaintenanceService = require('../services/MaintenanceService');
const Bus = require('../models/Bus');
const MaintenanceForecast = require('../models/MaintenanceForecast');
const PartsForecast = require('../models/PartsForecast');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [healthSummary, busCount, maintenanceForecasts, partsForecasts] = await Promise.all([
      MaintenanceService.getFleetHealthSummary(),
      Bus.countDocuments(),
      MaintenanceForecast.find().lean(),
      PartsForecast.find().lean(),
    ]);

    // Service distribution
    const serviceDistribution = {};
    for (const fc of maintenanceForecasts) {
      serviceDistribution[fc.serviceType] = (serviceDistribution[fc.serviceType] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        totalBuses: busCount,
        overdue: healthSummary.overdue,
        dueSoon: healthSummary.dueSoon,
        healthy: healthSummary.healthy,
        maintenanceForecasts: maintenanceForecasts.length,
        partsForecasts: partsForecasts.length,
        serviceDistribution,
        forecastTimeline: maintenanceForecasts
          .filter(f => f.forecastWindow === '30')
          .slice(0, 20)
          .map(f => ({ busAlias: f.busAlias, serviceType: f.serviceType, dueInDays: f.dueInDays, urgencyScore: f.urgencyScore })),
        partsDemand: partsForecasts
          .filter(f => f.forecastWindow === '30')
          .slice(0, 15)
          .map(p => ({ partNumber: p.partNumber, quantity: p.quantity })),
      },
    });
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
};
