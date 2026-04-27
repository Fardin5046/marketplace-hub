const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Dispute = require('../models/Dispute');
const Payout = require('../models/Payout');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing data…');

  await Promise.all([
    User.deleteMany({}), VendorProfile.deleteMany({}), Category.deleteMany({}),
    Product.deleteMany({}), Order.deleteMany({}), Review.deleteMany({}),
    Coupon.deleteMany({}), Dispute.deleteMany({}), Payout.deleteMany({}),
  ]);

  // ── Admin ──
  const admin = await User.create({ name: 'Admin', email: 'admin@marketly.com', passwordHash: 'Admin123!', role: 'admin' });
  console.log('Admin created:', admin.email);

  // ── Customers ──
  const customerData = [
    { name: 'Maya Kapoor', email: 'maya@example.com' },
    { name: 'Jordan Park', email: 'jordan@example.com' },
    { name: 'Elena Rodriguez', email: 'elena@example.com' },
    { name: 'Amir Hassan', email: 'amir@example.com' },
    { name: 'Sophia Chen', email: 'sophia@example.com' },
  ];
  const customers = [];
  for (const c of customerData) {
    const user = await User.create({ name: c.name, email: c.email, passwordHash: 'Customer123!', role: 'customer' });
    customers.push(user);
  }
  console.log(`${customers.length} customers created`);

  // ── Categories ──
  const catData = [
    { name: 'Electronics', slug: 'electronics', icon: 'Cpu', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80' },
    { name: 'Fashion', slug: 'fashion', icon: 'Shirt', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80' },
    { name: 'Home & Living', slug: 'home-living', icon: 'Lamp', image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&q=80' },
    { name: 'Sports', slug: 'sports', icon: 'Dumbbell', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba3e9776?w=600&q=80' },
    { name: 'Books', slug: 'books', icon: 'BookOpen', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80' },
    { name: 'Beauty', slug: 'beauty', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80' },
  ];
  const categories = [];
  for (const c of catData) {
    categories.push(await Category.create(c));
  }
  console.log(`${categories.length} categories created`);

  // ── Vendors ──
  const vendorData = [
    { name: 'Northwind Audio', email: 'vendor@northwind.com', storeName: 'Northwind Audio', slug: 'northwind-audio', tagline: 'Studio-grade sound, made simple', status: 'approved' },
    { name: 'Nova Threads', email: 'vendor@novathreads.com', storeName: 'Nova Threads', slug: 'nova-threads', tagline: 'Sustainable fashion for the modern world', status: 'approved' },
    { name: 'Lumina Home', email: 'vendor@luminahome.com', storeName: 'Lumina Home', slug: 'lumina-home', tagline: 'Minimal design, maximum comfort', status: 'approved' },
    { name: 'Peak Athletics', email: 'vendor@peak.com', storeName: 'Peak Athletics', slug: 'peak-athletics', tagline: 'Performance gear for everyday athletes', status: 'approved' },
    { name: 'Artisan Books', email: 'vendor@artisanbooks.com', storeName: 'Artisan Books', slug: 'artisan-books', tagline: 'Curated reads for curious minds', status: 'pending' },
    { name: 'Glow Lab', email: 'vendor@glowlab.com', storeName: 'Glow Lab', slug: 'glow-lab', tagline: 'Clean beauty, real results', status: 'pending' },
  ];
  const vendors = [];
  const vendorProfiles = [];
  for (const v of vendorData) {
    const user = await User.create({ name: v.name, email: v.email, passwordHash: 'Vendor123!', role: 'vendor' });
    const profile = await VendorProfile.create({
      user: user._id, storeName: v.storeName, slug: v.slug, tagline: v.tagline,
      approvalStatus: v.status, ratingAverage: 4.2 + Math.random() * 0.8, ratingCount: Math.floor(Math.random() * 200 + 50),
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.storeName)}&backgroundColor=0a0a0a&textColor=fafaf7`,
    });
    vendors.push(user);
    vendorProfiles.push(profile);
  }
  console.log(`${vendors.length} vendors created`);

  // ── Products ──
  const productTemplates = [
    { title: 'Nordic Pro Wireless Headphones', cat: 0, vendor: 0, price: 249, oldPrice: 299, discount: 17, badge: 'Best Seller', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80'], sizes: [], colors: [{ name: 'Matte Black', hex: '#0a0a0a' },{ name: 'Arctic White', hex: '#f5f5f4' }], desc: 'Experience studio-grade sound with our flagship wireless headphones. Featuring 40mm custom drivers, hybrid ANC, and 30-hour battery life.', specs: [{ label: 'Driver', value: '40mm custom dynamic' },{ label: 'Battery', value: '30 hours' },{ label: 'ANC', value: 'Hybrid active' },{ label: 'Weight', value: '250g' }] },
    { title: 'Aura Smart Speaker', cat: 0, vendor: 0, price: 129, badge: 'New', images: ['https://images.unsplash.com/photo-1543512214-318228f18546?w=600&q=80'], sizes: [], colors: [{ name: 'Space Gray', hex: '#444' }], desc: 'Room-filling 360° sound with built-in voice assistant. Seamlessly connects to your smart home ecosystem.' },
    { title: 'ProCast Studio Microphone', cat: 0, vendor: 0, price: 189, oldPrice: 219, discount: 14, images: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80'], sizes: [], colors: [], desc: 'Professional-grade USB condenser microphone for podcasting, streaming, and studio recording.' },
    { title: 'Merino Wool Overcoat', cat: 1, vendor: 1, price: 320, badge: 'Trending', images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'], sizes: ['S','M','L','XL'], colors: [{ name: 'Charcoal', hex: '#36454F' },{ name: 'Camel', hex: '#C19A6B' }], desc: 'Luxurious Italian merino wool overcoat with a modern, relaxed fit. Perfect for transitional weather.' },
    { title: 'Organic Cotton T-Shirt', cat: 1, vendor: 1, price: 45, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'], sizes: ['XS','S','M','L','XL'], colors: [{ name: 'White', hex: '#fff' },{ name: 'Black', hex: '#000' },{ name: 'Sage', hex: '#9DC183' }], desc: 'Everyday essential crafted from 100% GOTS-certified organic cotton. Pre-shrunk and enzyme-washed.' },
    { title: 'Denim Utility Jacket', cat: 1, vendor: 1, price: 165, oldPrice: 195, discount: 15, badge: 'Best Seller', images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&q=80'], sizes: ['S','M','L'], colors: [{ name: 'Indigo', hex: '#3F5277' }], desc: 'Rugged yet refined Japanese selvedge denim jacket with utility pockets and a relaxed workwear silhouette.' },
    { title: 'Ceramic Table Lamp', cat: 2, vendor: 2, price: 89, badge: 'New', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80'], sizes: [], colors: [{ name: 'Sand', hex: '#C2B280' },{ name: 'Sage', hex: '#9DC183' }], desc: 'Hand-thrown ceramic base with a natural linen shade. Each piece is one of a kind.' },
    { title: 'Modular Bookshelf', cat: 2, vendor: 2, price: 499, images: ['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80'], sizes: [], colors: [{ name: 'Walnut', hex: '#5C4033' },{ name: 'Oak', hex: '#B8860B' }], desc: 'Scandinavian-inspired modular shelving system in solid hardwood. Expand and rearrange as your collection grows.' },
    { title: 'Performance Running Shoes', cat: 3, vendor: 3, price: 159, oldPrice: 189, discount: 16, badge: 'Trending', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80'], sizes: ['7','8','9','10','11','12'], colors: [{ name: 'Volt', hex: '#CCFF00' },{ name: 'Core Black', hex: '#0a0a0a' }], desc: 'Engineered mesh upper with responsive foam midsole. Built for tempo runs and race day.' },
    { title: 'Carbon Fiber Tennis Racket', cat: 3, vendor: 3, price: 279, images: ['https://images.unsplash.com/photo-1617083934555-ac7e4c531bfe?w=600&q=80'], sizes: [], colors: [{ name: 'Black', hex: '#000' }], desc: 'Professional-grade carbon fiber frame with optimized sweet spot technology.' },
    { title: 'Yoga Mat Pro', cat: 3, vendor: 3, price: 79, badge: 'Best Seller', images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80'], sizes: [], colors: [{ name: 'Midnight', hex: '#191970' },{ name: 'Blush', hex: '#DE5D83' }], desc: 'Extra-thick 6mm natural rubber mat with alignment markings. Non-slip in any condition.' },
    { title: 'Smart Watch Ultra', cat: 0, vendor: 0, price: 399, badge: 'Limited', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'], sizes: [], colors: [{ name: 'Titanium', hex: '#878681' },{ name: 'Midnight', hex: '#191970' }], desc: 'Our most advanced smartwatch with titanium case, always-on display, and 72-hour battery life.' },
  ];

  const products = [];
  for (const t of productTemplates) {
    const category = categories[t.cat];
    const vendor = vendors[t.vendor];
    const vp = vendorProfiles[t.vendor];
    const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    const p = await Product.create({
      vendor: vendor._id, vendorProfile: vp._id,
      category: category._id, categorySlug: category.slug,
      title: t.title, slug,
      description: t.desc || 'Premium quality product from an independent vendor.',
      price: t.price, oldPrice: t.oldPrice || null, discountPercent: t.discount || 0,
      stock: Math.floor(Math.random() * 80 + 5),
      images: (t.images || []).map(url => ({ url, alt: t.title })),
      sizes: t.sizes || [], colors: t.colors || [],
      specs: t.specs || [],
      tags: [category.slug, vp.slug],
      badge: t.badge || '',
      isFeatured: !!t.badge,
      vendorName: vp.storeName, vendorSlug: vp.slug,
      ratingAverage: 3.5 + Math.random() * 1.5,
      ratingCount: Math.floor(Math.random() * 100 + 5),
      status: 'published',
    });
    products.push(p);
    await new Promise(r => setTimeout(r, 5)); // ensure unique slug
  }
  console.log(`${products.length} products created`);

  // Update category product counts
  for (const cat of categories) {
    cat.productCount = await Product.countDocuments({ category: cat._id });
    await cat.save();
  }

  // ── Orders ──
  const statuses = ['Pending', 'Processing', 'In Transit', 'Delivered'];
  for (let i = 0; i < 15; i++) {
    const customer = customers[i % customers.length];
    const p = products[i % products.length];
    const vendor = vendors[productTemplates[i % products.length].vendor];
    const vp = vendorProfiles[productTemplates[i % products.length].vendor];
    const qty = Math.floor(Math.random() * 3) + 1;
    const subtotal = p.price * qty;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;
    await Order.create({
      orderNumber: `ORD-SEED-${(i + 1).toString().padStart(3, '0')}`,
      customer: customer._id, vendor: vendor._id, vendorProfile: vp._id,
      items: [{ product: p._id, title: p.title, price: p.price, qty, image: p.images[0]?.url || '' }],
      shippingAddress: { fullName: customer.name, email: customer.email, address: '245 Hayes Street', city: 'San Francisco', state: 'CA', zip: '94102', country: 'United States' },
      subtotal, tax, total, shippingFee: 0,
      orderStatus: statuses[i % statuses.length],
      invoiceNumber: `INV-SEED-${(i + 1).toString().padStart(3, '0')}`,
      placedAt: new Date(Date.now() - (i * 2 * 86400000)),
    });
  }
  console.log('15 orders created');

  // ── Reviews ──
  for (let i = 0; i < 20; i++) {
    const customer = customers[i % customers.length];
    const p = products[i % products.length];
    try {
      await Review.create({
        product: p._id, customer: customer._id, vendor: p.vendor,
        rating: Math.floor(Math.random() * 2) + 4,
        title: ['Love it!', 'Great quality', 'Exceeded expectations', 'Would buy again', 'Perfect gift'][i % 5],
        comment: ['Absolutely worth every penny. The quality is outstanding.', 'Fast shipping and exactly as described.', 'My second purchase from this vendor. Never disappoints.', 'The attention to detail is remarkable.', 'Best purchase I\'ve made this year.'][i % 5],
      });
    } catch { /* duplicate */ }
  }
  console.log('Reviews created');

  // ── Coupons ──
  await Coupon.create({ code: 'MARKETLY10', type: 'percentage', value: 10, minOrderAmount: 50, validTo: new Date('2027-12-31'), isActive: true });
  await Coupon.create({ code: 'WELCOME20', type: 'percentage', value: 20, minOrderAmount: 100, maxDiscountAmount: 50, validTo: new Date('2027-12-31'), isActive: true });
  await Coupon.create({ code: 'FLAT15', type: 'fixed', value: 15, minOrderAmount: 75, validTo: new Date('2027-12-31'), isActive: true });
  console.log('3 coupons created');

  // ── Update vendor revenue ──
  for (let i = 0; i < 4; i++) {
    const vp = vendorProfiles[i];
    const vendorOrders = await Order.find({ vendor: vendors[i]._id });
    vp.totalRevenue = vendorOrders.reduce((s, o) => s + o.total, 0);
    vp.totalSales = vendorOrders.reduce((s, o) => s + o.items.reduce((ss, it) => ss + it.qty, 0), 0);
    vp.pendingPayout = vp.totalRevenue * 0.92;
    await vp.save();
  }

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────');
  console.log('Demo accounts:');
  console.log('  Admin:    admin@marketly.com    / Admin123!');
  console.log('  Vendor:   vendor@northwind.com  / Vendor123!');
  console.log('  Customer: maya@example.com      / Customer123!');
  console.log('  Coupons:  MARKETLY10, WELCOME20, FLAT15');
  console.log('─────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
