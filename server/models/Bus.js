const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true },
  alias: { type: String, required: true, unique: true },
  manufacturer: { type: String, default: '' },
  model: { type: String, default: '' },
  year: { type: Number },
  garage: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive', 'Maintenance', 'Retired'], default: 'Active' },
}, { timestamps: true });

busSchema.index({ alias: 1 });
busSchema.index({ status: 1 });

module.exports = mongoose.model('Bus', busSchema);
