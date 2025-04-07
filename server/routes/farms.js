const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');

// POST route to handle farm submissions
router.post('/farms', async (req, res) => {
  try {
    console.log('🔵 Received farm data:', req.body);

    let { name, location, products, bio, phone, email, website, hours, captcha } = req.body;

    // Validate required fields
    if (!name || !location || !products || !bio || !phone || !email) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // CAPTCHA check (placeholder logic)
    if (captcha !== '1234') {
      return res.status(400).json({ message: 'Invalid CAPTCHA.' });
    }

    // Normalize website: add https:// if missing
    if (website && !/^https?:\/\//i.test(website)) {
      website = 'https://' + website;
    }

    // Normalize location format
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

    console.log('🧭 Final parsed location:', location);

    // Create and save new farm
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
