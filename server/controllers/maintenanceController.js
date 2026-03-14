const MaintenanceRecord = require('../models/MaintenanceRecord');
const MaintenanceService = require('../services/MaintenanceService');

exports.getAll = async (req, res, next) => {
  try {
    const records = await MaintenanceService.getRecordsWithUrgency();
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id).lean();
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    record.urgencyScore = await MaintenanceService.calculateUrgencyScore(record);
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.getHealthSummary = async (req, res, next) => {
  try {
    const summary = await MaintenanceService.getFleetHealthSummary();
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
};
