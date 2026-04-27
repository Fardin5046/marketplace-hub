const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const { generateToken, setTokenCookie } = require('../utils/generateToken');
const slugify = require('slugify');

// POST /api/auth/register/customer
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash: password, role: 'customer' });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
};

// POST /api/auth/register/vendor
exports.registerVendor = async (req, res, next) => {
  try {
    const { name, email, password, storeName } = req.body;
    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ message: 'Name, email, password, and store name are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash: password, role: 'vendor' });
    const slug = slugify(storeName, { lower: true, strict: true }) + '-' + user._id.toString().slice(-4);
    await VendorProfile.create({
      user: user._id,
      storeName,
      slug,
      tagline: '',
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(storeName)}&backgroundColor=0a0a0a&textColor=fafaf7`,
    });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated.' });
    }
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    // If vendor, attach profile info
    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: user._id });
    }
    res.json({ user, token, vendorProfile });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully.' });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: user._id });
    }
    res.json({ user, vendorProfile });
  } catch (err) { next(err); }
};

// PATCH /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();
    res.json({ user });
  } catch (err) { next(err); }
};

// PATCH /api/auth/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }
    user.passwordHash = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) { next(err); }
};

// --- Address management ---
// GET /api/auth/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ addresses: user.addresses || [] });
  } catch (err) { next(err); }
};

// POST /api/auth/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = req.body;
    if (addr.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    user.addresses.push(addr);
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (err) { next(err); }
};

// DELETE /api/auth/addresses/:idx
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.splice(Number(req.params.idx), 1);
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) { next(err); }
};
