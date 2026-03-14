const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
  busAlias: { type: String, required: true, index: true },
  pmNumber: { type: String, default: '' },
  pmDescription: { type: String, default: '' },
  jobDescription: { type: String, default: '' },
  currentJobPlan: { type: String, default: '' },
  lastOdometerReading: { type: Number, default: 0 },
  nextTriggerKm: { type: Number, default: 0 },
  unitsToGoKm: { type: Number, default: 0 },
  unitsLateKm: { type: Number, default: 0 },
  daysLate: { type: Number, default: 0 },
  frequencyKm: { type: Number, default: 0 },
  toleranceKm: { type: Number, default: 0 },
  reportDate: { type: Date, default: Date.now },
  serviceType: { type: String, default: '', index: true },
  pmStatus: { type: String, default: '' },
  assetStatus: { type: String, default: '' },
}, { timestamps: true });

maintenanceRecordSchema.index({ busAlias: 1, serviceType: 1 });

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
