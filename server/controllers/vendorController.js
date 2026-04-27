const VendorProfile = require('../models/VendorProfile');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payout = require('../models/Payout');

// GET /api/vendor/overview
exports.getVendorOverview = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user._id });
    const [totalProducts, lowStock, orders, recentOrders, topProducts] = await Promise.all([
      Product.countDocuments({ vendor: req.user._id }),
      Product.countDocuments({ vendor: req.user._id, stock: { $lt: 10, $gt: 0 } }),
      Order.find({ vendor: req.user._id }),
      Order.find({ vendor: req.user._id }).sort({ placedAt: -1 }).limit(5).populate('customer', 'name'),
      Product.find({ vendor: req.user._id }).sort({ ratingCount: -1 }).limit(4),
    ]);
    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const revenueAgg = await Order.aggregate([
      { $match: { vendor: req.user._id, placedAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $month: '$placedAt' }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueData = revenueAgg.map(r => ({ month: months[r._id - 1], revenue: r.revenue, orders: r.orders }));
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
    res.json({ profile, totalProducts, lowStock, pendingOrders, revenueData, recentOrders, topProducts });
  } catch (err) { next(err); }
};

// GET /api/vendor/revenue
exports.getVendorRevenue = async (req, res, next) => {
  try {
    const orders = await Order.find({ vendor: req.user._id });
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const refunds = orders.filter(o => o.paymentStatus === 'refunded').length;
    const refundRate = totalOrders > 0 ? Math.round((refunds / totalOrders) * 1000) / 10 : 0;
    // Monthly data
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const revenueAgg = await Order.aggregate([
      { $match: { vendor: req.user._id, placedAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $month: '$placedAt' }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueData = revenueAgg.map(r => ({ month: months[r._id - 1], revenue: r.revenue, orders: r.orders }));
    res.json({ totalRevenue, totalOrders, avgOrderValue, refundRate, revenueData });
  } catch (err) { next(err); }
};

// GET /api/vendor/orders
exports.getVendorOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { vendor: req.user._id };
    if (status && status !== 'All') filter.orderStatus = status;
    const orders = await Order.find(filter).sort({ placedAt: -1 }).populate('customer', 'name email');
    res.json({ orders });
  } catch (err) { next(err); }
};

// GET /api/vendor/payouts
exports.getVendorPayouts = async (req, res, next) => {
  try {
    const payouts = await Payout.find({ vendor: req.user._id }).sort({ requestedAt: -1 });
    const profile = await VendorProfile.findOne({ user: req.user._id });
    res.json({ payouts, pendingBalance: profile?.pendingPayout || 0 });
  } catch (err) { next(err); }
};

// POST /api/vendor/payouts/request
exports.requestPayout = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile || profile.pendingPayout < 10) {
      return res.status(400).json({ message: 'Minimum payout amount is $10.' });
    }
    const payout = await Payout.create({
      vendor: req.user._id, vendorProfile: profile._id,
      amount: profile.pendingPayout, method: req.body.method || 'Bank transfer',
    });
    profile.pendingPayout = 0;
    await profile.save();
    res.status(201).json(payout);
  } catch (err) { next(err); }
};

// GET /api/vendor/store
exports.getVendorStore = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user._id });
    const productCount = await Product.countDocuments({ vendor: req.user._id });
    res.json({ profile, productCount });
  } catch (err) { next(err); }
};

// PATCH /api/vendor/store
exports.updateVendorStore = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Vendor profile not found.' });
    const { storeName, tagline, description, logoUrl, bannerUrl, policies } = req.body;
    if (storeName) profile.storeName = storeName;
    if (tagline !== undefined) profile.tagline = tagline;
    if (description !== undefined) profile.description = description;
    if (logoUrl !== undefined) profile.logoUrl = logoUrl;
    if (bannerUrl !== undefined) profile.bannerUrl = bannerUrl;
    if (policies !== undefined) profile.policies = policies;
    await profile.save();
    res.json(profile);
  } catch (err) { next(err); }
};
