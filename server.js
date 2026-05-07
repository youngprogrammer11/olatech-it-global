require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// Trust Render proxy
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Session for admin login
app.use(session({
  secret: process.env.SESSION_SECRET || 'olatech-admin-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Rate limiting for contact form
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/contact', apiLimiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// Public routes for testimonials and projects (for the frontend)
// Public blog endpoints
// Public settings endpoint
// Public services endpoint (custom added services)
app.get('/api/services', async (req, res) => {
  try {
    const Service = require('./models/Service');
    const data = await Service.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, data: [] });
  }
});

// Public services endpoint
app.get('/api/services', async (req, res) => {
  try {
    const Service = require('./models/Service');
    const data = await Service.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, data: [] });
  }
});

app.get('/api/settings/:key', async (req, res) => {
  try {
    const Settings = require('./models/Settings');
    const setting = await Settings.findOne({ key: req.params.key });
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, data: null });
  }
});

app.get('/api/blog', async (req, res) => {
  try {
    const Blog = require('./models/Blog');
    const data = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, data: [] });
  }
});

app.get('/api/blog/:slug', async (req, res) => {
  try {
    const Blog = require('./models/Blog');
    const post = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve blog pages
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

app.get('/blog/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog-post.html'));
});

app.get('/api/pricing', async (req, res) => {
  try {
    const Pricing = require('./models/Pricing');
    const data = await Pricing.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, data: [] });
  }
});

app.get('/api/testimonials', async (req, res) => {
  try {
    const Testimonial = require('./models/Testimonial');
    const data = await Testimonial.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, data: [] });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const Project = require('./models/Project');
    const data = await Project.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, data: [] });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', company: 'Olatech IT Global', timestamp: new Date().toISOString() });
});

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve main HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } else {
      console.log('⚠️  No MONGODB_URI — running without database');
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Olatech IT Global server running at http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
});

module.exports = app;
