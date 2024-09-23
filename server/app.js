// server/app.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Handle MongoDB connection events
mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error));
mongoose.connection.once('open', () => console.log('Connected to MongoDB'));

// Routes
const farmsRouter = require('./routes/farms');
app.use('/api/farms', farmsRouter);

// Start Server
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
