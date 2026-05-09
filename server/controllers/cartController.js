const User = require('../models/User');
const Product = require('../models/Product');

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    const cart = (user.cart || []).filter(item => item.product); // remove orphans
    res.json({ cart });
  } catch (err) { next(err); }
};

// POST /api/cart/items
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, qty = 1, size = '', color = '' } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required.' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const user = await User.findById(req.user._id);
    const existing = user.cart.find(
      item => item.product.toString() === productId && item.size === size && item.color === color
    );

    const currentQty = existing ? existing.qty : 0;
    const newQty = currentQty + Number(qty);

    if (newQty > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock.` });
    }

    if (existing) {
      existing.qty = newQty;
    } else {
      user.cart.push({ product: productId, qty: Number(qty), size, color });
    }
    await user.save();
    await user.populate('cart.product');
    res.json({ cart: user.cart });
  } catch (err) { next(err); }
};

// PATCH /api/cart/items/:productId  — now variant-aware via query params
exports.updateCartItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    const size = req.query.size || '';
    const color = req.query.color || '';
    const user = await User.findById(req.user._id);
    const item = user.cart.find(i =>
      i.product.toString() === req.params.productId &&
      (i.size || '') === size && (i.color || '') === color
    );
    if (!item) return res.status(404).json({ message: 'Item not in cart.' });

    // Stock validation
    const product = await Product.findById(req.params.productId);
    if (product && Number(qty) > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock.` });
    }

    item.qty = Math.max(1, Number(qty));
    await user.save();
    await user.populate('cart.product');
    res.json({ cart: user.cart });
  } catch (err) { next(err); }
};

// DELETE /api/cart/items/:productId  — variant-aware via query params
exports.removeFromCart = async (req, res, next) => {
  try {
    const size = req.query.size || '';
    const color = req.query.color || '';
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(i =>
      !(i.product.toString() === req.params.productId &&
        (i.size || '') === size && (i.color || '') === color)
    );
    await user.save();
    await user.populate('cart.product');
    res.json({ cart: user.cart });
  } catch (err) { next(err); }
};

// DELETE /api/cart  (clear cart)
exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ cart: [] });
  } catch (err) { next(err); }
};
