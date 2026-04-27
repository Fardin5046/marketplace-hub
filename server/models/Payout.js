const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile' },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, default: 'Bank transfer' },
  status: { type: String, enum: ['Pending', 'Paid', 'Rejected'], default: 'Pending' },
  requestedAt: { type: Date, default: Date.now },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

payoutSchema.index({ vendor: 1 });
payoutSchema.index({ status: 1 });

module.exports = mongoose.model('Payout', payoutSchema);
