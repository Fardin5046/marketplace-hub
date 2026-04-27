const router = require('express').Router();
const { validateCoupon, getCoupons, createCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/validate', validateCoupon);
router.get('/', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);

module.exports = router;
