const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  products: { type: [String], required: true },
  bio: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: String,
  hours: String,
  isApproved: { type: Boolean, default: false },
  photos: [String],
});

farmSchema.index({ location: '2dsphere' }); // For geospatial queries

module.exports = mongoose.model('Farm', farmSchema);
