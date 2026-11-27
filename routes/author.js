const express   = require('express');
const crypto    = require('crypto');
const rateLimit = require('express-rate-limit');
const Blog      = require('../models/Blog');

const router = express.Router();

// ─── AUTHOR DRAFT SUBMISSION ──────────────────────────
// A narrow door for an external author (Muse) to submit blog posts as
// DRAFTS only. Guarded by the AUTHOR_TOKEN environment variable: when it
// is not set, the door does not exist. The token can create drafts and
// nothing else: it cannot publish, read, edit or delete, and every post
// it creates is forced to published: false whatever the request says.
// The site owner reviews drafts in Admin and publishes them himself.

const authorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

function tokenMatches(provided, expected) {
  if (typeof provided !== 'string' || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

router.post('/blog', authorLimiter, async (req, res) => {
  const expected = process.env.AUTHOR_TOKEN;
  if (!expected) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  const header = req.get('authorization') || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!tokenMatches(provided, expected)) {
    return res.status(401).json({ success: false, message: 'Not authorised' });
  }

  const { title, excerpt, content, category, coverColor, featuredImage } = req.body || {};
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 200) {
    return res.status(400).json({ success: false, message: 'A title of 3 to 200 characters is required' });
  }
  if (typeof excerpt !== 'string' || !excerpt.trim() || excerpt.length > 300) {
    return res.status(400).json({ success: false, message: 'An excerpt of up to 300 characters is required' });
  }
  if (typeof content !== 'string' || !content.trim() || content.length > 200000) {
    return res.status(400).json({ success: false, message: 'Post content is required' });
  }
  if (category !== undefined && (typeof category !== 'string' || category.length > 60)) {
    return res.status(400).json({ success: false, message: 'Invalid category' });
  }
  if (coverColor !== undefined && (typeof coverColor !== 'string' || coverColor.length > 200)) {
    return res.status(400).json({ success: false, message: 'Invalid cover colour' });
  }
  if (featuredImage !== undefined && (typeof featuredImage !== 'string' || featuredImage.length > 1500000)) {
    return res.status(400).json({ success: false, message: 'Invalid featured image' });
  }

  try {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    const exists = await Blog.findOne({ slug });
    const finalSlug = exists ? `${slug}-${Date.now()}` : slug;

    const item = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content,
      category: category || 'Technology',
      coverColor: coverColor || undefined,
      featuredImage: featuredImage || '',
      published: false
    });
    res.status(201).json({
      success: true,
      data: { id: item._id, title: item.title, slug: item.slug, published: item.published }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
