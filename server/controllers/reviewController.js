const Review = require('../models/Review');
const Product = require('../models/Product');

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ message: 'productId and rating are required.' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const review = await Review.create({
      product: productId, customer: req.user._id, vendor: product.vendor,
      rating: Number(rating), title: title || '', comment: comment || '',
    });
    // Update product rating
    const reviews = await Review.find({ product: productId });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    product.ratingAverage = Math.round(avg * 10) / 10;
    product.ratingCount = reviews.length;
    await product.save();
    res.status(201).json(review);
  } catch (err) { next(err); }
};

// GET /api/products/:productId/reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('customer', 'name avatarUrl').sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) { next(err); }
};

// GET /api/account/reviews
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('product', 'title slug images').sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) { next(err); }
};
