const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Coupon = require('../models/Coupon');

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'card', deliveryMethod = 'standard', couponCode } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ message: 'Shipping address is required (fullName, address, city).' });
    }

    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    // Validate stock availability
    for (const item of user.cart) {
      if (!item.product) continue;
      if (item.qty > item.product.stock) {
        return res.status(400).json({ message: `"${item.product.title}" only has ${item.product.stock} in stock (you have ${item.qty} in cart).` });
      }
    }
    // Group items by vendor
    const vendorMap = {};
    for (const item of user.cart) {
      if (!item.product) continue;
      const vid = item.product.vendor.toString();
      if (!vendorMap[vid]) vendorMap[vid] = [];
      vendorMap[vid].push(item);
    }
    // Calculate coupon discount
    let discountRate = 0;
    let fixedDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.validTo > new Date() && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        if (coupon.type === 'percentage') {
          discountRate = coupon.value / 100;
        } else {
          fixedDiscount = coupon.value;
        }
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
    const timestamp = Date.now().toString(36).toUpperCase();
    const orders = [];
    let idx = 0;
    for (const [vendorId, items] of Object.entries(vendorMap)) {
      idx++;
      const orderNumber = `ORD-${timestamp}-${idx}`;
      const invoiceNumber = `INV-${timestamp}-${idx}`;
      const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
      const discount = discountRate > 0
        ? Math.round(subtotal * discountRate * 100) / 100
        : Math.min(fixedDiscount, subtotal);
      const shippingFee = deliveryMethod === 'express' ? 18 : deliveryMethod === 'same-day' ? 28 : (subtotal > 80 ? 0 : 9);
      const tax = Math.round(Math.max(0, subtotal - discount) * 0.08 * 100) / 100;
      const total = Math.round(Math.max(0, subtotal - discount + shippingFee + tax) * 100) / 100;
      const vendorProfile = await VendorProfile.findOne({ user: vendorId });
      const order = await Order.create({
        orderNumber, customer: req.user._id, vendor: vendorId,
        vendorProfile: vendorProfile?._id,
        items: items.map(i => ({
          product: i.product._id, title: i.product.title,
          price: i.product.price, qty: i.qty,
          size: i.size || '', color: i.color || '',
          image: i.product.images?.[0]?.url || '', sku: i.product.sku || '',
        })),
        shippingAddress, subtotal, discount, shippingFee, tax, total,
        couponCode: couponCode || '', paymentMethod, deliveryMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        invoiceNumber,
      });
      // Update stock
      for (const i of items) {
        await Product.findByIdAndUpdate(i.product._id, { $inc: { stock: -i.qty } });
      }
      // Update vendor revenue
      if (vendorProfile) {
        vendorProfile.totalRevenue += total;
        vendorProfile.totalSales += items.reduce((s, i) => s + i.qty, 0);
        vendorProfile.pendingPayout += total * 0.92;
        await vendorProfile.save();
      }
      orders.push(order);
    }
    // Clear cart
    user.cart = [];
    await user.save();
    res.status(201).json({ orders });
  } catch (err) { next(err); }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ placedAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('vendor', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.customer._id.toString() !== req.user._id.toString() &&
        order.vendor._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    res.json(order);
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    order.orderStatus = status;
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};
