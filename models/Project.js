const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  category:      { type: String, required: true, enum: ['web', 'software', 'brand', 'marketing'] },
  categoryLabel: { type: String, trim: true },
  description:   { type: String, required: true, trim: true },
  theme:         { type: String, default: 'theme-fintech' },
  imageData:     { type: String, default: '' }, // base64 image
  featured:      { type: Boolean, default: false },
  order:         { type: Number, default: 0 },
  active:        { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
