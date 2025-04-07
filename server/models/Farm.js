const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  products: {
    type: [String],
    required: true,
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one product must be selected.'
    }
  },

  bio: {
    type: String,
    default: '',
    trim: true
  },

  phone: {
    type: String,
    default: '',
    trim: true
  },

  email: {
    type: String,
    default: '',
    trim: true
  },

  website: {
    type: String,
    default: '',
    trim: true
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: val => Array.isArray(val) && val.length === 2 &&
                          typeof val[0] === 'number' && typeof val[1] === 'number',
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  },

  isApproved: {
    type: Boolean,
    default: false
  },

  photos: {
    type: [String],
    default: []
  },

  hours: {
    type: String,
    default: '',
    trim: true
  }
});

farmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', farmSchema);
