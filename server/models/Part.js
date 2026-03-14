const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  partNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: '' },
  manufacturer: { type: String, default: '' },
  unit: { type: String, default: 'each' },
  createdAt: { type: Date, default: Date.now },
});

partSchema.index({ partNumber: 1 });

module.exports = mongoose.model('Part', partSchema);
