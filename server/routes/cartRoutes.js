const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/items', protect, addToCart);
router.patch('/items/:productId', protect, updateCartItem);
router.delete('/items/:productId', protect, removeFromCart);
router.delete('/', protect, clearCart);

module.exports = router;
