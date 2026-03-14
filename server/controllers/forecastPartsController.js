const PartsForecast = require('../models/PartsForecast');
const ForecastService = require('../services/ForecastService');

exports.getAll = async (req, res, next) => {
  try {
    const { window } = req.query;
    const filter = {};
    if (window) filter.forecastWindow = window;
    const forecasts = await PartsForecast.find(filter).sort({ quantity: -1 });
    res.json({ success: true, data: forecasts });
  } catch (err) { next(err); }
};

exports.generate = async (req, res, next) => {
  try {
    const forecasts = await ForecastService.generatePartsForecast();
    res.json({ success: true, data: forecasts, count: forecasts.length });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const fc = await PartsForecast.findByIdAndDelete(req.params.id);
    if (!fc) return res.status(404).json({ success: false, error: 'Forecast not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
