const mongoose = require("mongoose");

function normalizeQuantity(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric));
}

const servicePartSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  busModel: { type: String, required: true },
  partNumber: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    set: normalizeQuantity,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "quantity must be a whole number",
    },
  },
});

servicePartSchema.index({ serviceType: 1, busModel: 1 });

module.exports = mongoose.model("ServicePart", servicePartSchema);
