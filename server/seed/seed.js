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
const Notification = require('../models/Notification');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing data…');

  await Promise.all([
    User.deleteMany({}), VendorProfile.deleteMany({}), Category.deleteMany({}),
    Product.deleteMany({}), Order.deleteMany({}), Review.deleteMany({}),
    Coupon.deleteMany({}), Dispute.deleteMany({}), Payout.deleteMany({}),
    Notification.deleteMany({}),
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
    { name: 'Sports', slug: 'sports', icon: 'Dumbbell', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80' },
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
    { name: 'Artisan Books', email: 'vendor@artisanbooks.com', storeName: 'Artisan Books', slug: 'artisan-books', tagline: 'Curated reads for curious minds', status: 'approved' },
    { name: 'Glow Lab', email: 'vendor@glowlab.com', storeName: 'Glow Lab', slug: 'glow-lab', tagline: 'Clean beauty, real results', status: 'approved' },
  ];
  const vendors = [];
  const vendorProfiles = [];
  for (const v of vendorData) {
    const user = await User.create({ name: v.name, email: v.email, passwordHash: 'Vendor123!', role: 'vendor' });
    const profile = await VendorProfile.create({
      user: user._id, storeName: v.storeName, slug: v.slug, tagline: v.tagline,
      approvalStatus: v.status, ratingAverage: Math.round((4.2 + Math.random() * 0.8) * 10) / 10, ratingCount: Math.floor(Math.random() * 200 + 50),
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.storeName)}&backgroundColor=0a0a0a&textColor=fafaf7`,
    });
    vendors.push(user);
    vendorProfiles.push(profile);
  }
  console.log(`${vendors.length} vendors created`);

  // ── Products (52 items, all images verified) ──
  const I = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;
  const productTemplates = [
    // ── Electronics (cat:0, vendor:0) ──
    { title: 'Nordic Pro Wireless Headphones', cat: 0, vendor: 0, price: 249, oldPrice: 299, discount: 17, badge: 'Best Seller', images: [I('1505740420928-5e560c06d30e'),I('1484704849700-f032a568e944')], sizes: [], colors: [{name:'Matte Black',hex:'#0a0a0a'},{name:'Arctic White',hex:'#f5f5f4'}], desc: 'Studio-grade sound with 40mm drivers, hybrid ANC, and 30-hour battery.', specs: [{label:'Driver',value:'40mm'},{label:'Battery',value:'30h'},{label:'ANC',value:'Hybrid'},{label:'Weight',value:'250g'}] },
    { title: 'Aura Smart Speaker', cat: 0, vendor: 0, price: 129, badge: 'New', images: [I('1589003077984-894e133dabab')], sizes: [], colors: [{name:'Space Gray',hex:'#444'}], desc: 'Room-filling 360° sound with voice assistant and smart home integration.' },
    { title: 'ProCast Studio Microphone', cat: 0, vendor: 0, price: 189, oldPrice: 219, discount: 14, images: [I('1590602847861-f357a9332bbc')], sizes: [], colors: [], desc: 'Professional USB condenser mic for podcasting and streaming.' },
    { title: 'Smart Watch Ultra', cat: 0, vendor: 0, price: 399, badge: 'Limited', images: [I('1523275335684-37898b6baf30')], sizes: [], colors: [{name:'Titanium',hex:'#878681'},{name:'Midnight',hex:'#191970'}], desc: 'Titanium case, always-on display, and 72-hour battery life.' },
    { title: 'Noise-Cancelling Earbuds', cat: 0, vendor: 0, price: 179, oldPrice: 199, discount: 10, images: [I('1585386959984-a4155224a1ad')], sizes: [], colors: [{name:'Black',hex:'#0a0a0a'},{name:'White',hex:'#fff'}], desc: 'True wireless earbuds with adaptive ANC and 8h battery per charge.' },
    { title: 'Portable Bluetooth Speaker', cat: 0, vendor: 0, price: 89, badge: 'Trending', images: [I('1608248543803-ba4f8c70ae0b')], sizes: [], colors: [{name:'Teal',hex:'#008080'},{name:'Black',hex:'#000'}], desc: 'Waterproof IP67 speaker with 20h battery and deep bass.' },
    { title: 'Wireless Gaming Headset', cat: 0, vendor: 0, price: 159, images: [I('1583394838336-acd977736f90')], sizes: [], colors: [{name:'Black',hex:'#000'}], desc: 'Low-latency 2.4GHz wireless with surround sound.' },
    { title: 'USB-C Charging Hub', cat: 0, vendor: 0, price: 69, images: [I('1625772452859-1c03d5bf1137')], sizes: [], colors: [{name:'Silver',hex:'#C0C0C0'}], desc: '7-in-1 hub with HDMI 4K, USB-A, SD reader, and 100W PD.' },
    { title: 'Mechanical Keyboard Pro', cat: 0, vendor: 0, price: 149, badge: 'New', images: [I('1598327105666-5b89351aff97')], sizes: [], colors: [{name:'Black',hex:'#0a0a0a'},{name:'White',hex:'#f5f5f4'}], desc: 'Hot-swappable switches, RGB backlight, aluminum frame.' },
    // ── Fashion (cat:1, vendor:1) ──
    { title: 'Merino Wool Overcoat', cat: 1, vendor: 1, price: 320, badge: 'Trending', images: [I('1539533018447-63fcce2678e3'),I('1591047139829-d91aecb6caea')], sizes: ['S','M','L','XL'], colors: [{name:'Charcoal',hex:'#36454F'},{name:'Camel',hex:'#C19A6B'}], desc: 'Italian merino wool overcoat with modern relaxed fit.' },
    { title: 'Organic Cotton T-Shirt', cat: 1, vendor: 1, price: 45, images: [I('1521572163474-6864f9cf17ab')], sizes: ['XS','S','M','L','XL'], colors: [{name:'White',hex:'#fff'},{name:'Black',hex:'#000'},{name:'Sage',hex:'#9DC183'}], desc: '100% GOTS-certified organic cotton, pre-shrunk.' },
    { title: 'Denim Utility Jacket', cat: 1, vendor: 1, price: 165, oldPrice: 195, discount: 15, badge: 'Best Seller', images: [I('1576871337632-b9aef4c17ab9')], sizes: ['S','M','L'], colors: [{name:'Indigo',hex:'#3F5277'}], desc: 'Japanese selvedge denim with utility pockets.' },
    { title: 'Cashmere Crewneck Sweater', cat: 1, vendor: 1, price: 195, images: [I('1620799140408-edc6dcb6d633')], sizes: ['S','M','L','XL'], colors: [{name:'Oatmeal',hex:'#D2C6A5'},{name:'Navy',hex:'#1B2A4A'}], desc: 'Grade-A Mongolian cashmere in a classic crewneck.' },
    { title: 'Linen Summer Shirt', cat: 1, vendor: 1, price: 85, badge: 'New', images: [I('1603252109303-2751441dd157')], sizes: ['S','M','L','XL'], colors: [{name:'Sky',hex:'#87CEEB'},{name:'White',hex:'#fff'}], desc: 'Breathable French linen, relaxed fit for warm weather.' },
    { title: 'Slim Fit Chinos', cat: 1, vendor: 1, price: 78, images: [I('1551232864-3f0890e580d9')], sizes: ['28','30','32','34','36'], colors: [{name:'Khaki',hex:'#C3B091'},{name:'Navy',hex:'#000080'}], desc: 'Stretch cotton twill with slim tapered leg.' },
    { title: 'Leather Belt Classic', cat: 1, vendor: 1, price: 55, images: [I('1556905055-8f358a7a47b2')], sizes: ['S','M','L'], colors: [{name:'Brown',hex:'#8B4513'},{name:'Black',hex:'#000'}], desc: 'Full-grain Italian leather with brushed nickel buckle.' },
    { title: 'Canvas Sneakers', cat: 1, vendor: 1, price: 69, badge: 'Trending', images: [I('1560769629-975ec94e6a86')], sizes: ['7','8','9','10','11','12'], colors: [{name:'White',hex:'#fff'},{name:'Navy',hex:'#1B2A4A'}], desc: 'Vulcanized rubber sole with organic cotton canvas.' },
    { title: 'Wool Blend Scarf', cat: 1, vendor: 1, price: 42, images: [I('1576566588028-4147f3842f27')], sizes: [], colors: [{name:'Grey',hex:'#808080'},{name:'Burgundy',hex:'#800020'}], desc: 'Soft wool-cashmere blend with fringed edges.' },
    // ── Home & Living (cat:2, vendor:2) ──
    { title: 'Ceramic Table Lamp', cat: 2, vendor: 2, price: 89, badge: 'New', images: [I('1513506003901-1e6a229e2d15')], sizes: [], colors: [{name:'Sand',hex:'#C2B280'},{name:'Sage',hex:'#9DC183'}], desc: 'Hand-thrown ceramic base with natural linen shade.' },
    { title: 'Modular Bookshelf', cat: 2, vendor: 2, price: 499, images: [I('1594620302200-9a762244a156')], sizes: [], colors: [{name:'Walnut',hex:'#5C4033'},{name:'Oak',hex:'#B8860B'}], desc: 'Scandinavian modular shelving in solid hardwood.' },
    { title: 'Velvet Sofa', cat: 2, vendor: 2, price: 1299, badge: 'Best Seller', images: [I('1555041469-a586c61ea9bc')], sizes: [], colors: [{name:'Forest',hex:'#228B22'},{name:'Charcoal',hex:'#36454F'}], desc: 'Mid-century velvet sofa with walnut legs and foam cushions.' },
    { title: 'Linen Throw Pillows', cat: 2, vendor: 2, price: 39, images: [I('1616486338812-3dadae4b4ace')], sizes: [], colors: [{name:'Cream',hex:'#FFFDD0'},{name:'Rust',hex:'#B7410E'}], desc: 'Set of 2 stonewashed linen cushion covers.' },
    { title: 'Marble Coffee Table', cat: 2, vendor: 2, price: 449, badge: 'Trending', images: [I('1567538096630-e0c55bd6374c')], sizes: [], colors: [{name:'White Marble',hex:'#F5F5F0'}], desc: 'Genuine Carrara marble on matte black steel base.' },
    { title: 'Woven Area Rug', cat: 2, vendor: 2, price: 189, images: [I('1558171813-4c088753af8f')], sizes: [], colors: [{name:'Natural',hex:'#D2B48C'}], desc: 'Hand-woven jute and cotton blend, 5x7 ft reversible.' },
    { title: 'Modern Floor Lamp', cat: 2, vendor: 2, price: 129, images: [I('1540932239986-30128078f3c5')], sizes: [], colors: [{name:'Brass',hex:'#B5A642'},{name:'Black',hex:'#000'}], desc: 'Adjustable arc floor lamp with linen shade and marble base.' },
    { title: 'Scented Candle Set', cat: 2, vendor: 2, price: 34, badge: 'New', images: [I('1586023492125-27b2c045efd7')], sizes: [], colors: [], desc: 'Set of 3 soy wax candles: Vanilla, Cedarwood, Lavender.' },
    // ── Sports (cat:3, vendor:3) ──
    { title: 'Performance Running Shoes', cat: 3, vendor: 3, price: 159, oldPrice: 189, discount: 16, badge: 'Trending', images: [I('1542291026-7eec264c27ff'),I('1606107557195-0e29a4b5b4aa')], sizes: ['7','8','9','10','11','12'], colors: [{name:'Volt',hex:'#CCFF00'},{name:'Core Black',hex:'#0a0a0a'}], desc: 'Engineered mesh with responsive foam midsole for race day.' },
    { title: 'Carbon Fiber Tennis Racket', cat: 3, vendor: 3, price: 279, images: [I('1554068865-24cecd4e34b8')], sizes: [], colors: [{name:'Black',hex:'#000'}], desc: 'Professional carbon fiber with optimized sweet spot.' },
    { title: 'Yoga Mat Pro', cat: 3, vendor: 3, price: 79, badge: 'Best Seller', images: [I('1601925260368-ae2f83cf8b7f')], sizes: [], colors: [{name:'Midnight',hex:'#191970'},{name:'Blush',hex:'#DE5D83'}], desc: 'Extra-thick 6mm natural rubber mat with alignment markings.' },
    { title: 'Resistance Band Set', cat: 3, vendor: 3, price: 29, images: [I('1598440947619-2c35fc9aa908')], sizes: [], colors: [], desc: 'Set of 5 bands with carry bag. Light to extra-heavy.' },
    { title: 'Insulated Water Bottle', cat: 3, vendor: 3, price: 35, badge: 'New', images: [I('1585909695284-32d2985ac9c0')], sizes: [], colors: [{name:'Steel',hex:'#71797E'},{name:'Black',hex:'#000'}], desc: '32oz double-wall vacuum insulated. Cold 24h, hot 12h.' },
    { title: 'Training Sneakers', cat: 3, vendor: 3, price: 119, images: [I('1491553895911-0055eca6402d')], sizes: ['7','8','9','10','11','12'], colors: [{name:'White',hex:'#fff'},{name:'Black',hex:'#000'}], desc: 'Cross-training shoes with flexible sole and breathable knit.' },
    { title: 'Fitness Tracker Band', cat: 3, vendor: 3, price: 49, badge: 'Trending', images: [I('1575311373937-040b8e1fd5b6')], sizes: [], colors: [{name:'Black',hex:'#000'},{name:'Rose',hex:'#FF007F'}], desc: 'Heart rate, sleep tracking, 7-day battery, waterproof.' },
    { title: 'Compression Leggings', cat: 3, vendor: 3, price: 59, images: [I('1571019613454-1cb2f99b2d8b')], sizes: ['XS','S','M','L','XL'], colors: [{name:'Black',hex:'#000'},{name:'Navy',hex:'#000080'}], desc: 'High-waist compression leggings with moisture-wicking fabric.' },
    // ── Books (cat:4, vendor:4) ──
    { title: 'The Art of Design Thinking', cat: 4, vendor: 4, price: 28, badge: 'Best Seller', images: [I('1544947950-fa07a98d237f')], sizes: [], colors: [], desc: 'A guide to creative problem-solving and innovation.' },
    { title: 'Mindful Living', cat: 4, vendor: 4, price: 22, images: [I('1495446815901-a7297e633e8d')], sizes: [], colors: [], desc: 'Practical techniques for mindfulness and intentional living.' },
    { title: 'Modern Architecture', cat: 4, vendor: 4, price: 45, badge: 'New', images: [I('1512820790803-83ca734da794')], sizes: [], colors: [], desc: 'Coffee-table book showcasing 100 iconic buildings worldwide.' },
    { title: 'Creative Writing Masterclass', cat: 4, vendor: 4, price: 19, images: [I('1524578271613-d550eacf6090')], sizes: [], colors: [], desc: 'Step-by-step guide to compelling fiction and non-fiction.' },
    { title: 'The Science of Cooking', cat: 4, vendor: 4, price: 35, badge: 'Trending', images: [I('1543002588-bfa74002ed7e')], sizes: [], colors: [], desc: 'Chemistry behind your favorite recipes with 200 experiments.' },
    { title: 'Startup Playbook', cat: 4, vendor: 4, price: 26, images: [I('1532012197267-da84d127e765')], sizes: [], colors: [], desc: 'Strategies for founding, funding, and scaling a startup.' },
    { title: 'World History Atlas', cat: 4, vendor: 4, price: 52, images: [I('1497633762265-9d179a990aa6')], sizes: [], colors: [], desc: 'Illustrated atlas covering 5,000 years of civilization.' },
    { title: 'Poetry Collection: Seasons', cat: 4, vendor: 4, price: 16, images: [I('1457369804613-52c61a468e7d')], sizes: [], colors: [], desc: 'Curated anthology of 120 poems celebrating nature.' },
    // ── Beauty (cat:5, vendor:5) ──
    { title: 'Vitamin C Glow Serum', cat: 5, vendor: 5, price: 42, badge: 'Best Seller', images: [I('1570172619644-dfd03ed5d881')], sizes: [], colors: [], desc: '20% Vitamin C with hyaluronic acid for radiant skin.' },
    { title: 'Hydrating Face Cream', cat: 5, vendor: 5, price: 38, images: [I('1556228578-0d85b1a4d571')], sizes: [], colors: [], desc: 'Ceramides and squalane for 72-hour hydration.' },
    { title: 'Natural Lip Balm Set', cat: 5, vendor: 5, price: 18, badge: 'New', images: [I('1631729371254-42c2892f0e6e')], sizes: [], colors: [], desc: 'Set of 4 organic lip balms: Vanilla, Rose, Mint, Honey.' },
    { title: 'Retinol Night Cream', cat: 5, vendor: 5, price: 54, badge: 'Trending', images: [I('1612817288484-6f916006741a')], sizes: [], colors: [], desc: 'Encapsulated retinol with peptides for overnight renewal.' },
    { title: 'Coconut Body Oil', cat: 5, vendor: 5, price: 28, images: [I('1526947425960-945c6e72858f')], sizes: [], colors: [], desc: 'Cold-pressed virgin coconut oil with vitamin E.' },
    { title: 'Rose Clay Face Mask', cat: 5, vendor: 5, price: 24, images: [I('1596462502278-27bfdc403348')], sizes: [], colors: [], desc: 'French rose clay and kaolin that purifies and brightens.' },
    { title: 'Makeup Brush Set', cat: 5, vendor: 5, price: 45, images: [I('1522335789203-aabd1fc54bc9')], sizes: [], colors: [], desc: '12-piece vegan brush set with bamboo handles.' },
    { title: 'Niacinamide Toner', cat: 5, vendor: 5, price: 22, badge: 'New', images: [I('1556740738-b6a63e27c4df')], sizes: [], colors: [], desc: '5% Niacinamide with witch hazel to minimize pores.' },
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
      ratingAverage: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
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
  for (let i = 0; i < 30; i++) {
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
  console.log('30 orders created');

  // ── Reviews ──
  for (let i = 0; i < 40; i++) {
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
  for (let i = 0; i < vendors.length; i++) {
    const vp = vendorProfiles[i];
    const vendorOrders = await Order.find({ vendor: vendors[i]._id });
    vp.totalRevenue = vendorOrders.reduce((s, o) => s + o.total, 0);
    vp.totalSales = vendorOrders.reduce((s, o) => s + o.items.reduce((ss, it) => ss + it.qty, 0), 0);
    vp.pendingPayout = vp.totalRevenue * 0.92;
    await vp.save();
  }

  // ── Notifications ──
  const adminNotifs = [
    { type: 'vendor', title: 'New vendor registration', message: 'Artisan Books has applied for vendor status.', link: '/admin/vendors' },
    { type: 'vendor', title: 'New vendor registration', message: 'Glow Lab has applied for vendor status.', link: '/admin/vendors' },
    { type: 'order', title: 'New order placed', message: 'Order ORD-SEED-001 placed by Maya Kapoor.', link: '/admin' },
    { type: 'order', title: 'New order placed', message: 'Order ORD-SEED-005 placed by Sophia Chen.', link: '/admin' },
    { type: 'dispute', title: 'New dispute opened', message: 'A customer has filed a dispute on an order.', link: '/admin/disputes' },
    { type: 'system', title: 'Platform milestone', message: 'Marketly has reached 50 products! 🎉', link: '/admin' },
  ];
  for (let i = 0; i < adminNotifs.length; i++) {
    await Notification.create({ user: admin._id, ...adminNotifs[i], read: i > 2, createdAt: new Date(Date.now() - i * 3600000) });
  }
  const vendorNotifs = [
    { type: 'order', title: 'New order received', message: 'You received order ORD-SEED-001 for Nordic Pro Wireless Headphones.' },
    { type: 'review', title: 'New product review', message: 'A customer rated your product 5 stars!' },
    { type: 'payout', title: 'Payout processed', message: 'Your payout of $432.50 has been initiated.' },
    { type: 'system', title: 'Welcome to Marketly!', message: 'Your vendor account has been approved. Start adding products!' },
  ];
  for (let i = 0; i < vendorNotifs.length; i++) {
    await Notification.create({ user: vendors[0]._id, ...vendorNotifs[i], read: i > 1, createdAt: new Date(Date.now() - i * 7200000) });
  }
  console.log('Notifications created');

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
