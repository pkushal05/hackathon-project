const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  severityWeight: { type: Number, default: 1 },
  includes: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ServiceType', serviceTypeSchema);
