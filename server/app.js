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

// Middleware
app.use(cors({
  origin: '*', // Change to frontend URL when deploying: 'https://yourfrontend.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// User signup route
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

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User login route
app.post('/api/auth/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
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

// Farm routes
// ✅ NEW: No auth required for submissions
app.post('/api/farms', async (req, res) => {

  try {
    const newFarm = new Farm(req.body);
    const savedFarm = await newFarm.save();
    res.status(201).json(savedFarm);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create farm' });
  }
});

app.get('/api/farms', async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch farms' });
  }
});

app.put('/api/farms/:id', async (req, res) => {
  try {
    const updatedFarm = await Farm.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedFarm) return res.status(404).json({ message: 'Farm not found' });
    res.status(200).json(updatedFarm);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update farm' });
  }
});

app.delete('/api/farms/:id', async (req, res) => {
  try {
    const deletedFarm = await Farm.findByIdAndDelete(req.params.id);
    if (!deletedFarm) return res.status(404).json({ message: 'Farm not found' });
    res.status(200).json({ message: 'Farm deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete farm' });
  }
});

// ONLY ONE SERVER LISTENER!
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
