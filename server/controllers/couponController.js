const Coupon = require('../models/Coupon');

// POST /api/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required.' });
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code.' });
    if (coupon.validTo < new Date()) return res.status(400).json({ message: 'Coupon has expired.' });
    if (coupon.validFrom > new Date()) return res.status(400).json({ message: 'Coupon is not yet active.' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached.' });
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) return res.status(400).json({ message: `Minimum order of $${coupon.minOrderAmount} required.` });
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal || 0) * (coupon.value / 100);
      if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
    } else {
      discount = coupon.value;
    }
    res.json({ valid: true, code: coupon.code, type: coupon.type, value: coupon.value, discount: Math.round(discount * 100) / 100 });
  } catch (err) { next(err); }
};

// GET /api/coupons (admin)
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) { next(err); }
};

// POST /api/coupons (admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, type, value, minOrderAmount, maxDiscountAmount, validFrom, validTo, usageLimit, isActive } = req.body;
    if (!code || !value || !validTo) {
      return res.status(400).json({ message: 'Code, value, and valid-to date are required.' });
    }
    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      type: type || 'percentage',
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validTo: new Date(validTo),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: isActive !== false,
    });
    res.status(201).json(coupon);
  } catch (err) { next(err); }
};

// PUT /api/coupons/:id (admin)
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    const { code, type, value, minOrderAmount, maxDiscountAmount, validFrom, validTo, usageLimit, isActive } = req.body;
    if (code !== undefined) coupon.code = code.toUpperCase().trim();
    if (type !== undefined) coupon.type = type;
    if (value !== undefined) coupon.value = Number(value);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (validFrom !== undefined) coupon.validFrom = new Date(validFrom);
    if (validTo !== undefined) coupon.validTo = new Date(validTo);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (isActive !== undefined) coupon.isActive = isActive;
    await coupon.save();
    res.json(coupon);
  } catch (err) { next(err); }
};

// DELETE /api/coupons/:id (admin)
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    res.json({ message: 'Coupon deleted.' });
  } catch (err) { next(err); }
};
