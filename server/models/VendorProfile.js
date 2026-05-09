const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeName: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  tagline: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  policies: { type: String, default: '' },
}, { timestamps: true });

vendorProfileSchema.index({ approvalStatus: 1 });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
