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
        const farms = Array.isArray(req.body) ? req.body : [req.body]; // Check if req.body is an array or a single object

        // Insert multiple farms or just one farm
        const savedFarms = await Farm.insertMany(farms);

        // Send back the saved farms as the response
        res.status(201).json(savedFarms);
    } catch (error) {
        console.error('Error creating farms:', error);
        res.status(500).json({ message: 'Failed to create farms' });
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

// PUT route to update a farm by ID
app.put('/api/farms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, products, bio, phone, website, photos } = req.body;

        // Find and update the farm
        const updatedFarm = await Farm.findByIdAndUpdate(id, {
            name,
            location,
            products,
            bio,
            phone,
            website,
            photos
        }, { new: true, runValidators: true });

        if (!updatedFarm) {
            return res.status(404).json({ message: 'Farm not found' });
        }

        res.status(200).json(updatedFarm); // Return updated farm data
    } catch (error) {
        console.error('Error updating farm:', error);
        res.status(500).json({ message: 'Failed to update farm' });
    }
});


// DELETE route to delete a farm by ID
app.delete('/api/farms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFarm = await Farm.findOneAndDelete({ _id: id }); // Note: Not using ObjectId
        if (!deletedFarm) {
            return res.status(404).json({ message: 'Farm not found' });
        }
        res.status(200).json({ message: 'Farm deleted successfully', deletedFarm });
    } catch (error) {
        console.error('Error deleting farm:', error);
        res.status(500).json({ message: 'Failed to delete farm' });
    }
});




// Server Listener
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
