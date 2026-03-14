const Part = require('../models/Part');

exports.getAll = async (req, res, next) => {
  try {
    const parts = await Part.find().sort({ name: 1 });
    res.json({ success: true, data: parts });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ success: false, error: 'Part not found' });
    res.json({ success: true, data: part });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const part = await Part.create(req.body);
    res.status(201).json({ success: true, data: part });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!part) return res.status(404).json({ success: false, error: 'Part not found' });
    res.json({ success: true, data: part });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ success: false, error: 'Part not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
