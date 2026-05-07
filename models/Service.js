const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  tags:        [{ type: String, trim: true }],
  icon:        { type: String, default: 'default' }, // icon key
  order:       { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);
