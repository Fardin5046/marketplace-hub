const router = require('express').Router();
const { getVendorOverview, getVendorRevenue, getVendorOrders, getVendorPayouts, requestPayout, getVendorStore, updateVendorStore } = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { authorize, requireApprovedVendor } = require('../middleware/role');

router.use(protect, authorize('vendor'));

// Store info (accessible even if pending so vendor can see status)
router.get('/store', getVendorStore);
router.patch('/store', updateVendorStore);

// Everything else requires approved vendor
router.use(requireApprovedVendor);
router.get('/overview', getVendorOverview);
router.get('/revenue', getVendorRevenue);
router.get('/orders', getVendorOrders);
router.get('/payouts', getVendorPayouts);
router.post('/payouts/request', requestPayout);

module.exports = router;
