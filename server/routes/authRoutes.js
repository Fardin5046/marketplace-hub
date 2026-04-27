const router = require('express').Router();
const { registerCustomer, registerVendor, login, logout, getMe, updateProfile, changePassword, getAddresses, addAddress, deleteAddress } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register/customer', registerCustomer);
router.post('/register/vendor', registerVendor);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, changePassword);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:idx', protect, deleteAddress);

module.exports = router;
