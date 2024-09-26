const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Farm = require('./models/Farm');

dotenv.config(); // Loading environment variables

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware

app.use(cors()); // Allow all origins
app.use(express.json()); // To parse JSON request bodies

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Routes


// POST route to create a new farm
app.post('/api/farms', async (req, res) => {
    try {
        const { name, location, products, bio, phone, website, photos } = req.body;
        
        // Create a new Farm instance
        const newFarm = new Farm({
            name,
            location,  // Expecting [longitude, latitude]
            products,  // Array of products
            bio,
            phone,
            website,
            photos      // Array of photo URLs
        });

        // Save the farm to the database
        const savedFarm = await newFarm.save();

        // Send back the saved farm as the response
        res.status(201).json(savedFarm);
    } catch (error) {
        console.error('Error creating farm:', error);
        res.status(500).json({ message: 'Failed to create farm' });
    }
});

// GET route to fetch all farms
app.get('/api/farms', async (req, res) => {
    try {
        const farms = await Farm.find(); // Fetch all farms from the database
        res.json(farms); // Send the farms as JSON
    } catch (error) {
        console.error('Error fetching farms:', error);
        res.status(500).json({ message: 'Failed to fetch farms' });
    }
});


// Server Listener
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
