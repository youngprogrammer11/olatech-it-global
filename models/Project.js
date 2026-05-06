const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  category:      { type: String, required: true, enum: ['web', 'software', 'brand', 'marketing'] },
  categoryLabel: { type: String, trim: true },
  description:   { type: String, required: true, trim: true },
  theme:         { type: String, default: 'theme-fintech' },
  imageData:     { type: String, default: '' },
  // Case study fields
  challenge:     { type: String, trim: true },
  solution:      { type: String, trim: true },
  results:       { type: String, trim: true },
  tech:          [{ type: String, trim: true }],
  liveUrl:       { type: String, trim: true },
  featured:      { type: Boolean, default: false },
  order:         { type: Number, default: 0 },
  active:        { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
