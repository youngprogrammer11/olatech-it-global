const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');
const rateLimit  = require('express-rate-limit');
const requireAuth = require('../middleware/auth');
const { verifyTotp } = require('../middleware/totp');
const Contact    = require('../models/Contact');
const Testimonial = require('../models/Testimonial');
const Project    = require('../models/Project');
const Pricing    = require('../models/Pricing');
const Blog       = require('../models/Blog');
const Settings   = require('../models/Settings');
const Service    = require('../models/Service');
const { Resend } = require('resend');

// Email the site owner whenever the admin panel is logged into.
// Never blocks or fails the login itself.
const sendLoginAlert = (req) => {
  try {
    if (!process.env.RESEND_API_KEY) return;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const when = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    resend.emails.send({
      from: 'Olatech Website <onboarding@resend.dev>',
      to: process.env.EMAIL_TO || 'olakanmiquadri@gmail.com',
      subject: 'Admin login alert: Olatech panel',
      html: `<h2>Admin login alert</h2>
             <p>Your Olatech admin panel was just logged into.</p>
             <p><strong>Time:</strong> ${when} (Africa/Lagos)</p>
             <p><strong>IP address:</strong> ${req.ip || 'unknown'}</p>
             <p>If this was not you, change the admin password immediately.</p>`
    }).catch((e) => console.error('Login alert email failed:', e.message));
  } catch (e) {
    console.error('Login alert email failed:', e.message);
  }
};

// ─── LOGIN ───────────────────────────────────────────
// Brute-force protection: at most 5 login attempts per IP per 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { password, totp } = req.body;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPassword     = process.env.ADMIN_PASSWORD;

  if (!adminPasswordHash && !adminPassword) {
    console.error('Admin login is not configured: set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH in the environment.');
    return res.status(503).json({ success: false, message: 'Admin login is not configured on the server' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password required' });
  }

  let match = false;
  if (adminPasswordHash) {
    match = await bcrypt.compare(String(password), adminPasswordHash);
  } else {
    const given    = Buffer.from(String(password));
    const expected = Buffer.from(String(adminPassword));
    match = given.length === expected.length && crypto.timingSafeEqual(given, expected);
  }
  if (!match) {
    return res.status(401).json({ success: false, message: 'Wrong password' });
  }

  // Second factor, active only when ADMIN_TOTP_SECRET is set in the
  // environment. Removing that variable returns the login to password
  // only, which is also the recovery path if the authenticator is lost.
  const totpSecret = process.env.ADMIN_TOTP_SECRET;
  if (totpSecret) {
    if (!totp) {
      return res.status(401).json({ success: false, code: 'TOTP_REQUIRED', message: 'Authenticator code required' });
    }
    if (!verifyTotp(totpSecret, totp)) {
      return res.status(401).json({ success: false, code: 'TOTP_INVALID', message: 'Invalid authenticator code' });
    }
  }

  req.session.isAdmin = true;
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ success: false, message: 'Session error' });
    }
    console.log('Admin logged in, session ID:', req.session.id);
    sendLoginAlert(req);
    res.json({ success: true, message: 'Logged in' });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ─── CONTACTS ────────────────────────────────────────
router.get('/contacts', requireAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/contacts/:id', requireAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/contacts/:id', requireAuth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUBLIC TESTIMONIAL SUBMISSION (no auth needed) ───
// Spam protection: at most 10 submissions per IP per 15 minutes.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' }
});

router.post('/testimonials/submit', submitLimiter, async (req, res) => {
  try {
    const { name, role, company, quote, photo } = req.body;
    if (!name || !role || !quote) {
      return res.status(400).json({ success: false, message: 'Name, role and review are required' });
    }
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    await Testimonial.create({
      name, role, company, quote, photo: photo || '',
      initials, status: 'pending', active: false
    });
    res.status(201).json({ success: true, message: 'Thank you! Your review has been submitted and will appear after approval.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TESTIMONIALS ─────────────────────────────────────
router.get('/testimonials', requireAuth, async (req, res) => {
  try {
    const data = await Testimonial.find().sort({ status: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/testimonials', requireAuth, async (req, res) => {
  try {
    const { name, role, company, quote, color } = req.body;
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const item = await Testimonial.create({ name, role, company, quote, color, initials });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/testimonials/:id', requireAuth, async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/testimonials/:id/approve', requireAuth, async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', active: true },
      { new: true }
    );
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/testimonials/:id/reject', requireAuth, async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', active: false },
      { new: true }
    );
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/testimonials/:id', requireAuth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PROJECTS ─────────────────────────────────────────
router.get('/projects', requireAuth, async (req, res) => {
  try {
    const data = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/projects', requireAuth, async (req, res) => {
  try {
    const item = await Project.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/projects/:id', requireAuth, async (req, res) => {
  try {
    const item = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/projects/:id', requireAuth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PRICING ──────────────────────────────────────────
router.get('/pricing', requireAuth, async (req, res) => {
  try {
    const data = await Pricing.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/pricing', requireAuth, async (req, res) => {
  try {
    const item = await Pricing.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/pricing/:id', requireAuth, async (req, res) => {
  try {
    const item = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/pricing/:id', requireAuth, async (req, res) => {
  try {
    await Pricing.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── BLOG ─────────────────────────────────────────────
router.get('/blog', requireAuth, async (req, res) => {
  try {
    const data = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/blog', requireAuth, async (req, res) => {
  try {
    const { title, excerpt, content, category, coverColor, featuredImage, published } = req.body;
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check slug is unique
    const exists = await Blog.findOne({ slug });
    const finalSlug = exists ? `${slug}-${Date.now()}` : slug;

    const item = await Blog.create({ title, slug: finalSlug, excerpt, content, category, coverColor, featuredImage, published });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/blog/:id', requireAuth, async (req, res) => {
  try {
    const item = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/blog/:id', requireAuth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SERVICES ─────────────────────────────────────────
router.get('/services', requireAuth, async (req, res) => {
  try {
    const data = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/services', requireAuth, async (req, res) => {
  try {
    const item = await Service.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/services/:id', requireAuth, async (req, res) => {
  try {
    const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/services/:id', requireAuth, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SERVICES ─────────────────────────────────────────
router.get('/services', requireAuth, async (req, res) => {
  try {
    const data = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/services', requireAuth, async (req, res) => {
  try {
    const item = await Service.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/services/:id', requireAuth, async (req, res) => {
  try {
    const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/services/:id', requireAuth, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SETTINGS ─────────────────────────────────────────
router.get('/settings/:key', requireAuth, async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/settings', requireAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/settings/:key', requireAuth, async (req, res) => {
  try {
    await Settings.findOneAndDelete({ key: req.params.key });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
