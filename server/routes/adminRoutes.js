const router = require('express').Router();
const { getAllVendors, getPendingVendors, approveVendor, rejectVendor, getDisputes, updateDispute, getAdminOverview } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/overview', getAdminOverview);
router.get('/vendors', getAllVendors);
router.get('/vendors/pending', getPendingVendors);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/reject', rejectVendor);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id', updateDispute);

module.exports = router;
