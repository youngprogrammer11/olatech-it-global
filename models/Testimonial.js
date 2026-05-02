const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  role:     { type: String, required: true, trim: true },
  company:  { type: String, trim: true },
  quote:    { type: String, required: true, trim: true },
  initials: { type: String, trim: true },
  color:    { type: String, default: 'linear-gradient(135deg,#2563eb,#38bdf8)' },
  order:    { type: Number, default: 0 },
  active:   { type: Boolean, default: true },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
