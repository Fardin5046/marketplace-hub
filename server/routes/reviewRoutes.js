const router = require('express').Router();
const { createReview, getProductReviews, getMyReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);
router.get('/product/:productId', getProductReviews);

module.exports = router;
