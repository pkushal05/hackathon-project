const mongoose = require('mongoose');

const maintenanceForecastSchema = new mongoose.Schema({
  busAlias: { type: String, required: true, index: true },
  serviceType: { type: String, required: true },
  urgencyScore: { type: Number, default: 0 },
  dueInDays: { type: Number, default: 0 },
  dueDate: { type: Date },
  forecastWindow: { type: String, enum: ['7', '14', '30'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MaintenanceForecast', maintenanceForecastSchema);
