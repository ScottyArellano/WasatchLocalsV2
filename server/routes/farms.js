const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');

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
    if (captcha && captcha !== '1234') {
      return res.status(400).json({ message: 'Invalid CAPTCHA.' });
    }

    // 🌐 Ensure website has protocol
    if (website && !/^https?:\/\//i.test(website)) {
      website = 'https://' + website;
    }

    // 🧭 Normalize location format
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
        if (!Array.isArray(location) || location.length !== 2) {
          return res.status(400).json({ message: 'Invalid location format.' });
        }
      } catch {
        return res.status(400).json({ message: 'Failed to parse location.' });
      }
    } else if (
      typeof location === 'object' &&
      location !== null &&
      location.type === 'Point' &&
      Array.isArray(location.coordinates)
    ) {
      location = location.coordinates;
    }

    // ✅ Build and save new farm
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
