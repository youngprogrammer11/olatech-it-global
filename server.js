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
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["https://www.google.com", "https://maps.google.com"],
      connectSrc: ["'self'"]
    }
  }
}));

// Trust Render proxy
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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
