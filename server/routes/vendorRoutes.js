const router = require('express').Router();
const { getVendorOverview, getVendorRevenue, getVendorOrders, getVendorPayouts, requestPayout, getVendorStore, updateVendorStore } = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('vendor'));

router.get('/overview', getVendorOverview);
router.get('/revenue', getVendorRevenue);
router.get('/orders', getVendorOrders);
router.get('/payouts', getVendorPayouts);
router.post('/payouts/request', requestPayout);
router.get('/store', getVendorStore);
router.patch('/store', updateVendorStore);

module.exports = router;
