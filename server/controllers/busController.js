const Bus = require('../models/Bus');

exports.getAll = async (req, res, next) => {
  try {
    const buses = await Bus.find().sort({ alias: 1 });
    res.json({ success: true, data: buses });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, error: 'Bus not found' });
    res.json({ success: true, data: bus });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, data: bus });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bus) return res.status(404).json({ success: false, error: 'Bus not found' });
    res.json({ success: true, data: bus });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, error: 'Bus not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
