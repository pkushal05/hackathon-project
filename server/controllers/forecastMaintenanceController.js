const MaintenanceForecast = require('../models/MaintenanceForecast');
const ForecastService = require('../services/ForecastService');

exports.getAll = async (req, res, next) => {
  try {
    const { window } = req.query;
    const filter = {};
    if (window) filter.forecastWindow = window;
    const forecasts = await MaintenanceForecast.find(filter).sort({ urgencyScore: -1 });
    res.json({ success: true, data: forecasts });
  } catch (err) { next(err); }
};

exports.generate = async (req, res, next) => {
  try {
    const forecasts = await ForecastService.generateMaintenanceForecast();
    res.json({ success: true, data: forecasts, count: forecasts.length });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const fc = await MaintenanceForecast.findByIdAndDelete(req.params.id);
    if (!fc) return res.status(404).json({ success: false, error: 'Forecast not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
