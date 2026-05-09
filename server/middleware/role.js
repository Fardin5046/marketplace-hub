const VendorProfile = require('../models/VendorProfile');

// Restrict to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user.role}' is not authorized to access this route.` });
    }
    next();
  };
};

// Check that vendor is approved before allowing vendor-only actions
const requireApprovedVendor = async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Vendor access required.' });
    }
    const profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(403).json({ message: 'Vendor profile not found. Complete onboarding first.' });
    }
    if (profile.approvalStatus !== 'approved') {
      return res.status(403).json({ message: `Vendor status is '${profile.approvalStatus}'. Admin approval required.` });
    }
    req.vendorProfile = profile;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authorize, requireApprovedVendor };
