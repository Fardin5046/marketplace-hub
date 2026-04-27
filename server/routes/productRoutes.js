const router = require('express').Router();
const { getProducts, getProductBySlug, getRelatedProducts, createProduct, updateProduct, deleteProduct, getVendorProducts } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', getProducts);
router.get('/vendor', protect, authorize('vendor'), getVendorProducts);
router.get('/:slug', getProductBySlug);
router.get('/:productId/related', getRelatedProducts);
router.post('/', protect, authorize('vendor'), createProduct);
router.put('/:id', protect, authorize('vendor'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
