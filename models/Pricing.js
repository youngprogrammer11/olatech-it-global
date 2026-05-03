const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  service:     { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price:       { type: String, required: true, trim: true }, // e.g. "₦150,000" or "From $500"
  period:      { type: String, default: 'project' },         // e.g. "project", "month", "hour"
  features:    [{ type: String, trim: true }],               // list of what is included
  highlighted: { type: Boolean, default: false },            // makes this card stand out
  order:       { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pricing', pricingSchema);
