const VendorProfile = require('../models/VendorProfile');
const User = require('../models/User');
const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/admin/vendors
exports.getAllVendors = async (req, res, next) => {
  try {
    const profiles = await VendorProfile.find().populate('user', 'name email createdAt').sort({ createdAt: -1 });
    res.json({ vendors: profiles });
  } catch (err) { next(err); }
};

// GET /api/admin/vendors/pending
exports.getPendingVendors = async (req, res, next) => {
  try {
    const profiles = await VendorProfile.find({ approvalStatus: 'pending' }).populate('user', 'name email createdAt');
    res.json({ vendors: profiles });
  } catch (err) { next(err); }
};

// PATCH /api/admin/vendors/:id/approve
exports.approveVendor = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Vendor profile not found.' });
    profile.approvalStatus = 'approved';
    await profile.save();
    res.json({ message: 'Vendor approved.', vendor: profile });
  } catch (err) { next(err); }
};

// PATCH /api/admin/vendors/:id/reject
exports.rejectVendor = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Vendor profile not found.' });
    profile.approvalStatus = 'rejected';
    await profile.save();
    res.json({ message: 'Vendor rejected.', vendor: profile });
  } catch (err) { next(err); }
};

// GET /api/admin/disputes
exports.getDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find()
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });
    res.json({ disputes });
  } catch (err) { next(err); }
};

// PATCH /api/admin/disputes/:id
exports.updateDispute = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found.' });
    if (status) dispute.status = status;
    if (resolution) dispute.resolution = resolution;
    await dispute.save();
    res.json(dispute);
  } catch (err) { next(err); }
};

// GET /api/admin/overview
exports.getAdminOverview = async (req, res, next) => {
  try {
    const [totalUsers, totalVendors, pendingVendors, totalProducts, totalOrders, totalDisputes, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      VendorProfile.countDocuments(),
      VendorProfile.countDocuments({ approvalStatus: 'pending' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Dispute.countDocuments({ status: { $ne: 'Resolved' } }),
      Order.find().sort({ placedAt: -1 }).limit(5).populate('customer', 'name'),
    ]);
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
    res.json({
      totalUsers, totalVendors, pendingVendors, totalProducts, totalOrders,
      totalDisputes, totalRevenue: totalRevenue[0]?.total || 0, recentOrders,
    });
  } catch (err) { next(err); }
};
