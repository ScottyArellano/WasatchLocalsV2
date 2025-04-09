const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const Farm = require('./models/Farm');
const User = require('./models/user');
const auth = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// ======================
// Middleware
// ======================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// ======================
// MongoDB connection
// ======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// ======================
// Serve frontend
// ======================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ======================
// AUTH ROUTES
// ======================

// Signup
app.post('/api/auth/signup', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================
// FARM ROUTES
// ======================

<<<<<<< HEAD
// Submit new farm (public)
app.post('/api/farms', async (req, res) => {
  console.log('🔵 POST /api/farms HIT');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    const { name, location, products, bio, phone, email, website, hours, photos } = req.body;

    if (!name || !location || !products || !bio || !phone || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
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
      photos: Array.isArray(photos) ? photos : [],
      isApproved: false
    });
=======

// Submit new farm (public)


// Submit new farm (public)
app.post(
  '/api/farms',
  [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('bio', 'Bio is required').not().isEmpty().trim().escape(),
    check('email', 'Email is required').isEmail(),
    check('phone', 'Phone is required').not().isEmpty(),
    check('website', 'Website is required').optional().isURL(),
    
    // Products: Ensure it's a non-empty array of valid strings
    check('products', 'Products must be a non-empty array').isArray({ min: 1 }),
    check('products.*', 'Each product must be a string').isString(),
    
    // Location: Ensure location exists and has proper coordinates
    check('location', 'Location is required').not().isEmpty(),
    check('location.coordinates', 'Coordinates must be an array of numbers').isArray().withMessage('Coordinates should be an array').bail()
    .custom((value) => {
      if (value.length !== 2 || !value.every(val => !isNaN(val))) {
        throw new Error('Coordinates should contain exactly two numeric values.');
      }
      return true;
    }),

    // Photos: Each should be a valid URL if provided
    check('photos', 'Photos must be an array of URLs').optional().isArray(),
    check('photos.*', 'Each photo URL must be a valid URL').optional().isURL()
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newFarm = new Farm({
        ...req.body,
        isApproved: false,
      });
>>>>>>> dev

      const savedFarm = await newFarm.save();
      res.status(201).json({ message: 'Farm created', farm: savedFarm });
    } catch (error) {
      console.error('Error in /api/farms:', error);
      res.status(500).json({ message: 'Failed to create farm', error: error.message });
    }
  }
);



// Get all farms
app.get('/api/farms', async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch farms' });
  }
});

// Approve farm (admin)
app.patch('/api/farms/:id/approve', async (req, res) => {
  try {
    const farm = await Farm.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json(farm);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve farm' });
  }
});

// Update farm
app.put('/api/farms/:id', async (req, res) => {
  try {
    const updatedFarm = await Farm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedFarm) return res.status(404).json({ message: 'Farm not found' });
    res.status(200).json(updatedFarm);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update farm' });
  }
});

// Delete farm
app.delete('/api/farms/:id', async (req, res) => {
  try {
    const deletedFarm = await Farm.findByIdAndDelete(req.params.id);
    if (!deletedFarm) return res.status(404).json({ message: 'Farm not found' });
    res.status(200).json({ message: 'Farm deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete farm' });
  }
});

// ======================
// Start server
// ======================
// ...all your setup code...

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;


