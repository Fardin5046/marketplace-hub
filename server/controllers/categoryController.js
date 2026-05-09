const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('slugify');

// GET /api/categories — compute product counts dynamically
exports.getCategories = async (req, res, next) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    // Compute counts dynamically
    const counts = await Product.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id?.toString()] = c.count; });
    cats.forEach(c => { c.productCount = countMap[c._id.toString()] || 0; });
    res.json(cats);
  } catch (err) { next(err); }
};

// GET /api/categories/:id
exports.getCategory = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found.' });
    res.json(cat);
  } catch (err) { next(err); }
};

// POST /api/categories (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });
    const slug = slugify(name, { lower: true, strict: true });
    const cat = await Category.create({ name, slug, icon: icon || '', image: image || '' });
    res.status(201).json(cat);
  } catch (err) { next(err); }
};

// PUT /api/categories/:id (admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, icon, image, isActive } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found.' });
    if (name) { cat.name = name; cat.slug = slugify(name, { lower: true, strict: true }); }
    if (icon !== undefined) cat.icon = icon;
    if (image !== undefined) cat.image = image;
    if (isActive !== undefined) cat.isActive = isActive;
    await cat.save();
    res.json(cat);
  } catch (err) { next(err); }
};

// DELETE /api/categories/:id (admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) { next(err); }
};
