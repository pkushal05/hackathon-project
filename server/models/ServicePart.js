const mongoose = require('mongoose');

const servicePartSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  busModel: { type: String, required: true },
  partNumber: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

servicePartSchema.index({ serviceType: 1, busModel: 1 });

module.exports = mongoose.model('ServicePart', servicePartSchema);
