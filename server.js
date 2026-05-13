require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security ──
app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ── Session ──
app.use(session({
  secret: process.env.SESSION_SECRET || 'olatech-admin-secret-2024',
  resave: false,
  saveUninitialized: false,
  store: process.env.MONGODB_URI
    ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI, touchAfter: 24 * 3600 })
    : undefined,
  cookie: { secure: false, httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// ── Rate limiting ──
app.use('/api/contact', rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many requests. Please try again later.' }
}));

// ── Static files ──
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin',   require('./routes/admin'));

// ── Public API endpoints ──
app.get('/api/services', async (req, res) => {
  try {
    const data = await require('./models/Service').find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, data: [] }); }
});

app.get('/api/settings/:key', async (req, res) => {
  try {
    const setting = await require('./models/Settings').findOne({ key: req.params.key });
    res.json({ success: true, data: setting });
  } catch { res.status(500).json({ success: false, data: null }); }
});

app.get('/api/blog', async (req, res) => {
  try {
    const data = await require('./models/Blog').find({ published: true }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, data: [] }); }
});

app.get('/api/blog/:slug', async (req, res) => {
  try {
    const post = await require('./models/Blog').findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/pricing', async (req, res) => {
  try {
    const data = await require('./models/Pricing').find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, data: [] }); }
});

app.get('/api/testimonials', async (req, res) => {
  try {
    const data = await require('./models/Testimonial').find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, data: [] }); }
});

app.get('/api/projects', async (req, res) => {
  try {
    const data = await require('./models/Project').find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, data: [] }); }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', company: 'Olatech IT Global', timestamp: new Date().toISOString() });
});

// ── Sitemap ──
app.get('/sitemap.xml', async (req, res) => {
  try {
    const posts   = await require('./models/Blog').find({ published: true }).select('slug updatedAt');
    const baseUrl = 'https://olatech-it-global.onrender.com';
    const pages   = [
      { url: '/',     priority: '1.0', changefreq: 'weekly'  },
      { url: '/blog', priority: '0.8', changefreq: 'weekly'  },
      ...posts.map(p => ({
        url:        `/blog/${p.slug}`,
        priority:   '0.7',
        changefreq: 'monthly',
        lastmod:    new Date(p.updatedAt).toISOString().split('T')[0]
      }))
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch { res.status(500).send('Error generating sitemap'); }
});

// ── Page routes ──
app.get('/blog',       (req, res) => res.sendFile(path.join(__dirname, 'public', 'blog.html')));
app.get('/blog/:slug', (req, res) => res.sendFile(path.join(__dirname, 'public', 'blog-post.html')));
app.get('/admin',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/',           (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use(           (req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

// ── MongoDB ──
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
