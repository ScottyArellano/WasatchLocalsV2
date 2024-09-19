// server/models/Farm.js

const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  id: Number,
  name: String,
  location: {
    type: [Number], // [longitude, latitude]
    required: true,
    index: '2dsphere', // For geospatial queries
  },
  products: [String],
  bio: String,
  phone: String,
  website: String,
  photos: [String],
});

module.exports = mongoose.model('Farm', farmSchema);
