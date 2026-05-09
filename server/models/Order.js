const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  image: { type: String, default: '' },
  sku: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile' },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['card', 'apple', 'cod'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'paid' },
  orderStatus: { type: String, enum: ['Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'], default: 'Pending' },
  invoiceNumber: { type: String, default: '' },
  deliveryMethod: { type: String, enum: ['standard', 'express', 'same-day'], default: 'standard' },
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true });

orderSchema.index({ customer: 1 });
orderSchema.index({ vendor: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ placedAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
