// server/routes/farms.js

const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');

// GET all farms
router.get('/', async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single farm by ID (Optional)
router.get('/:id', getFarm, (req, res) => {
  res.json(res.farm);
});

// Middleware function to get farm by ID
async function getFarm(req, res, next) {
  let farm;
  try {
    farm = await Farm.findOne({ id: req.params.id });
    if (farm == null) {
      return res.status(404).json({ message: 'Cannot find farm' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.farm = farm;
  next();
}

module.exports = router;
