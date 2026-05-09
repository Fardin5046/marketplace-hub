const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  categorySlug: { type: String, default: '' },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  sku: { type: String, default: '', uppercase: true },
  brand: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, default: null },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  stock: { type: Number, default: 0, min: 0 },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
  }],
  sizes: [{ type: String }],
  colors: [{
    name: { type: String },
    hex: { type: String },
  }],
  tags: [{ type: String }],
  specs: [{
    label: { type: String },
    value: { type: String },
  }],
  ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  badge: { type: String, enum: ['', 'New', 'Trending', 'Best Seller', 'Limited'], default: '' },
  isFeatured: { type: Boolean, default: false },
  // Denormalized vendor info for fast listing queries
  vendorName: { type: String, default: '' },
  vendorSlug: { type: String, default: '' },
}, { timestamps: true });

productSchema.index({ sku: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ categorySlug: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratingAverage: -1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
