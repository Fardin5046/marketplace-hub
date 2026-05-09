const router = require('express').Router();
const { getProducts, getProductBySlug, getProductById, getRelatedProducts, createProduct, updateProduct, deleteProduct, getVendorProducts } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize, requireApprovedVendor } = require('../middleware/role');

router.get('/', getProducts);
router.get('/vendor', protect, authorize('vendor'), getVendorProducts);// vendor get products list
router.get('/id/:id', protect, getProductById);
router.get('/:slug', getProductBySlug);
router.get('/:productId/related', getRelatedProducts);
router.post('/', protect, requireApprovedVendor, createProduct); // create product
router.put('/:id', protect, requireApprovedVendor, updateProduct);// update product
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);// delete product

module.exports = router;
