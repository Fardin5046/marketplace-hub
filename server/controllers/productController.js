const Product = require('../models/Product');
const VendorProfile = require('../models/VendorProfile');
const Category = require('../models/Category');
const slugify = require('slugify');

// GET /api/products  (public, with filtering/sorting/pagination)
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, minPrice, maxPrice, rating, inStock, vendor, featured, colors, sizes, page = 1, limit = 24 } = req.query;
    const filter = { status: 'published' };

    if (category) filter.categorySlug = category;
    if (vendor) filter.vendor = vendor;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (rating) filter.ratingAverage = { $gte: Number(rating) };
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (featured === 'true') filter.isFeatured = true;
    if (colors) filter['colors.name'] = { $in: colors.split(',') };
    if (sizes) filter.sizes = { $in: sizes.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { ratingAverage: -1 };
    else if (sort === 'new') sortObj = { createdAt: -1 };
    else if (sort === 'featured') sortObj = { isFeatured: -1, ratingAverage: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

// GET /api/products/:slug  (public)
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('vendor', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) { next(err); }
};

// GET /api/products/:productId/related  (public)
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const related = await Product.find({
      categorySlug: product.categorySlug,
      _id: { $ne: product._id },
      status: 'published',
    }).limit(4);
    res.json(related);
  } catch (err) { next(err); }
};

// POST /api/products  (vendor)
exports.createProduct = async (req, res, next) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
    if (!vendorProfile) return res.status(403).json({ message: 'Vendor profile not found.' });

    const { title, description, shortDescription, sku, brand, price, oldPrice, discountPercent, stock, images, sizes, colors, tags, specs, categoryId, status, badge, isFeatured } = req.body;

    if (!title || !price || !categoryId) {
      return res.status(400).json({ message: 'Title, price, and category are required.' });
    }

    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ message: 'Invalid category.' });

    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);

    const product = await Product.create({
      vendor: req.user._id,
      vendorProfile: vendorProfile._id,
      category: category._id,
      categorySlug: category.slug,
      title, slug, description, shortDescription, sku, brand,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      discountPercent: discountPercent ? Number(discountPercent) : 0,
      stock: stock ? Number(stock) : 0,
      images: images || [],
      sizes: sizes || [],
      colors: colors || [],
      tags: tags || [],
      specs: specs || [],
      status: status || 'published',
      badge: badge || '',
      isFeatured: isFeatured || false,
      vendorName: vendorProfile.storeName,
      vendorSlug: vendorProfile.slug,
    });

    res.status(201).json(product);
  } catch (err) { next(err); }
};

// PUT /api/products/:id  (vendor, own product only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your product.' });
    }

    const updates = req.body;
    if (updates.categoryId) {
      const category = await Category.findById(updates.categoryId);
      if (category) {
        product.category = category._id;
        product.categorySlug = category.slug;
      }
      delete updates.categoryId;
    }

    const allowed = ['title', 'description', 'shortDescription', 'sku', 'brand', 'price', 'oldPrice', 'discountPercent', 'stock', 'images', 'sizes', 'colors', 'tags', 'specs', 'status', 'badge', 'isFeatured'];
    allowed.forEach(key => {
      if (updates[key] !== undefined) product[key] = updates[key];
    });

    await product.save();
    res.json(product);
  } catch (err) { next(err); }
};

// DELETE /api/products/:id  (vendor, own product only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your product.' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted.' });
  } catch (err) { next(err); }
};

// GET /api/vendor/products  (vendor, own products only)
exports.getVendorProducts = async (req, res, next) => {
  try {
    const { search, category, status: statusFilter, page = 1, limit = 50 } = req.query;
    const filter = { vendor: req.user._id };
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.categorySlug = category;
    if (statusFilter) filter.status = statusFilter;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total });
  } catch (err) { next(err); }
};
