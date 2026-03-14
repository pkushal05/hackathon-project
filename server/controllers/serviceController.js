const ServiceType = require('../models/ServiceType');

exports.getAll = async (req, res, next) => {
  try {
    const services = await ServiceType.find().sort({ severityWeight: -1 });
    res.json({ success: true, data: services });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const service = await ServiceType.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service type not found' });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const service = await ServiceType.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const service = await ServiceType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, error: 'Service type not found' });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const service = await ServiceType.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service type not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
