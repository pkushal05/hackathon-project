const mongoose = require('mongoose');

const partsForecastSchema = new mongoose.Schema({
  partNumber: { type: String, required: true },
  quantity: { type: Number, required: true },
  forecastWindow: { type: String, enum: ['7', '14', '30'], required: true },
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PartsForecast', partsForecastSchema);
