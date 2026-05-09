const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String, default: '' },
  evidence: [{ type: String }], // URLs
  status: { type: String, enum: ['Open', 'Awaiting vendor', 'Resolved', 'Closed'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  resolution: { type: String, default: '' },
}, { timestamps: true });

disputeSchema.index({ status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
