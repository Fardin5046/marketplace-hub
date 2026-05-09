const Dispute = require('../models/Dispute');
const Order = require('../models/Order');

// POST /api/disputes  (customer creates dispute from an order)
exports.createDispute = async (req, res, next) => {
  try {
    const { orderId, reason, description } = req.body;
    if (!orderId || !reason) {
      return res.status(400).json({ message: 'Order ID and reason are required.' });
    }
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to dispute this order.' });
    }
    // Check for existing open dispute on same order
    const existing = await Dispute.findOne({ order: orderId, status: { $in: ['Open', 'Awaiting vendor'] } });
    if (existing) {
      return res.status(400).json({ message: 'An open dispute already exists for this order.' });
    }
    const dispute = await Dispute.create({
      order: orderId,
      customer: order.customer,
      vendor: order.vendor,
      reason,
      description: description || '',
    });
    res.status(201).json(dispute);
  } catch (err) { next(err); }
};
