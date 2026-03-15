const mongoose = require("mongoose");

function normalizeQuantity(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric));
}

const partsForecastSchema = new mongoose.Schema({
  partNumber: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
    set: normalizeQuantity,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "quantity must be a whole number",
    },
  },
  forecastWindow: { type: String, enum: ["7", "14", "30"], required: true },
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PartsForecast", partsForecastSchema);
