const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const requireAuth = require('../middleware/auth');
const Contact    = require('../models/Contact');
const Testimonial = require('../models/Testimonial');
const Project    = require('../models/Project');
const Pricing    = require('../models/Pricing');

// ─── LOGIN ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'olatech2024';

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password required' });
  }

  const match = password === adminPassword;
  if (!match) {
    return res.status(401).json({ success: false, message: 'Wrong password' });
  }

  req.session.isAdmin = true;
  res.json({ success: true, message: 'Logged in' });
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

// ─── TESTIMONIALS ─────────────────────────────────────
router.get('/testimonials', requireAuth, async (req, res) => {
  try {
    const data = await Testimonial.find().sort({ order: 1, createdAt: -1 });
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

module.exports = router;
