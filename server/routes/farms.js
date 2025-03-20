// routes/farm.js

const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const axios = require('axios');



// POST route to handle farm submissions
router.post('/farms', async (req, res) => { // Changed to router.post and path '/farms'
    try {
        console.log('Received farm data:', req.body); // Log incoming data

        const { name, location, products, bio, phone, email, website, hours, captcha } = req.body;

        // Validate required fields
        if (!name || !location || !products || !bio || !phone || !email) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        // Validate CAPTCHA
        if (captcha !== '1234') {
            return res.status(400).json({ message: 'Invalid CAPTCHA.' });
        }

        // Create new farm object
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

        // Save to database
        const savedFarm = await newFarm.save();

        res.status(201).json({ message: 'Farm submitted successfully. Awaiting approval.', farm: savedFarm });
    } catch (error) {
        console.error('Error creating farm:', error);
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

// GET a single farm by ID
router.get('/farms/:id', getFarm, (req, res) => {
    res.json(res.farm);
});

// Middleware function to get farm by ID
async function getFarm(req, res, next) {
    let farm;
    try {
        farm = await Farm.findById(req.params.id);
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
