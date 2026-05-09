const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // In development, allow any localhost port
    if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
      return callback(null, true);
    }
    // Also allow the configured CLIENT_URL
    const allowed = process.env.CLIENT_URL || 'http://localhost:8080';
    if (origin === allowed) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running and database is connected!' });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/disputes', require('./routes/disputeRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));

// Image upload endpoint (stores as base64 data URI for simplicity)
const upload = require('./middleware/upload');
const { protect } = require('./middleware/auth');
app.post('/api/upload', protect, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }
  const urls = req.files.map(f => {
    const b64 = f.buffer.toString('base64');
    return { url: `data:${f.mimetype};base64,${b64}`, alt: f.originalname };
  });
  res.json({ images: urls });
});

// Public vendors endpoint (no auth required)
const VendorProfile = require('./models/VendorProfile');
app.get('/api/vendors/public', async (req, res) => {
  try {
    const vendors = await VendorProfile.find({ approvalStatus: 'approved' })
      .select('storeName slug tagline logoUrl ratingAverage totalSales user createdAt')
      .sort({ totalSales: -1 });
    res.json({ vendors });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
