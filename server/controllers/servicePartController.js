const ServicePart = require('../models/ServicePart');

exports.getAll = async (req, res, next) => {
  try {
    const { serviceType, busModel } = req.query;
    const filter = {};
    if (serviceType) filter.serviceType = serviceType;
    if (busModel) filter.busModel = busModel;
    const parts = await ServicePart.find(filter);
    res.json({ success: true, data: parts });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const sp = await ServicePart.findById(req.params.id);
    if (!sp) return res.status(404).json({ success: false, error: 'Service part not found' });
    res.json({ success: true, data: sp });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const sp = await ServicePart.create(req.body);
    res.status(201).json({ success: true, data: sp });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const sp = await ServicePart.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sp) return res.status(404).json({ success: false, error: 'Service part not found' });
    res.json({ success: true, data: sp });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const sp = await ServicePart.findByIdAndDelete(req.params.id);
    if (!sp) return res.status(404).json({ success: false, error: 'Service part not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
