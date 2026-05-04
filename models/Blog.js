const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, trim: true, lowercase: true },
  excerpt:     { type: String, required: true, trim: true, maxlength: 300 },
  content:     { type: String, required: true },
  category:    { type: String, trim: true, default: 'Technology' },
  coverColor:  { type: String, default: 'linear-gradient(135deg,#0a1f5c,#2563eb)' },
  published:   { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

// Auto-generate slug from title
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
