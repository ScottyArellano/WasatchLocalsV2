const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const { body, validationResult } = require('express-validator');

// ✅ Validation Middleware
const validateFarm = [
  body('name').notEmpty().withMessage('Name is required'),
  body('location').custom((value) => {
    const coords = Array.isArray(value)
      ? value
      : value?.coordinates;

    if (
      coords &&
      Array.isArray(coords) &&
      coords.length === 2 &&
      typeof coords[0] === 'number' &&
      typeof coords[1] === 'number'
    ) {
      return true;
    }
    throw new Error('Coordinates should contain exactly two numeric values.');
  }),
  body('products').isArray({ min: 1 }).withMessage('Products must be a non-empty array'),
  body('photos').isArray().withMessage('Photos must be an array'),
  body('photos.*').isURL().withMessage('Each photo URL must be a valid URL'),
];

// ✅ POST route to handle farm submissions
router.post('/farms', validateFarm, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let { name, location, products, bio, phone, email, website, hours, captcha } = req.body;

    // CAPTCHA check (placeholder logic)
    if (captcha && captcha !== '1234') {
      return res.status(400).json({ message: 'Invalid CAPTCHA.' });
    }

    // Normalize website
    if (website && !/^https?:\/\//i.test(website)) {
      website = 'https://' + website;
    }

    // Normalize location format
    if (typeof location === 'string') {
      location = JSON.parse(location);
    } else if (
      typeof location === 'object' &&
      location !== null &&
      location.type === 'Point' &&
      Array.isArray(location.coordinates)
    ) {
      location = location.coordinates;
    }

    const newFarm = new Farm({
      name,
      location,
      products,
      bio,
      phone,
      email,
      website,
      hours,
      isApproved: false,
    });

    const savedFarm = await newFarm.save();

    res.status(201).json({
      message: '✅ Farm submitted successfully. Awaiting approval.',
      farm: savedFarm,
    });

  } catch (error) {
    console.error('❌ Error creating farm:', error);
    res.status(500).json({ message: 'Failed to create farm', error: error.message });
  }
});

// GET all farms
router.get('/farms', async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single farm by ID
router.get('/farms/:id', getFarm, (req, res) => {
  res.json(res.farm);
});

// Middleware: get farm by ID
async function getFarm(req, res, next) {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: 'Cannot find farm' });
    }
    res.farm = farm;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = router;
