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

<<<<<<< HEAD
// 🔁 Create a new farm (POST /api/farms)
router.post('/farms', async (req, res) => {
  try {
    console.log('🔵 Received farm data:', req.body);

    let {
      name,
      location,
      products,
      bio,
      phone,
      email,
      website,
      hours,
      photos,
      captcha,
    } = req.body;

    console.log('📸 Backend photos array:', photos);

    // 🔒 Basic field validation
    if (!name || !location || !products || !bio || !phone || !email) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // 🔐 CAPTCHA validation (optional)
=======
  try {
    let { name, location, products, bio, phone, email, website, hours, captcha } = req.body;

    // CAPTCHA check (placeholder logic)
>>>>>>> dev
    if (captcha && captcha !== '1234') {
      return res.status(400).json({ message: 'Invalid CAPTCHA.' });
    }

<<<<<<< HEAD
    // 🌐 Ensure website has protocol
=======
    // Normalize website
>>>>>>> dev
    if (website && !/^https?:\/\//i.test(website)) {
      website = 'https://' + website;
    }

    // 🧭 Normalize location format
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

<<<<<<< HEAD
    // ✅ Build and save new farm
=======
>>>>>>> dev
    const newFarm = new Farm({
      name,
      location: { type: 'Point', coordinates: location },
      products,
      bio,
      phone,
      email,
      website,
      hours,
      photos: Array.isArray(photos) ? photos : [],
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

// 🧠 Get all farms (GET /api/farms)
router.get('/farms', async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Get a single farm (GET /api/farms/:id)
router.get('/farms/:id', getFarm, (req, res) => {
  res.json(res.farm);
});

// 🔍 Middleware: Load farm by ID
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
