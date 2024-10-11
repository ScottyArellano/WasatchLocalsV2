const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Farm = require('./models/Farm');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating JWT
const User = require('./models/user');
const path = require('path');
const { check, validationResult } = require('express-validator'); // For validating user inputs


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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Handle root URL '/' - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));  // Adjust if needed
});



// POST route to register a new user
app.post('/api/auth/signup', [
    // Validate user inputs
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user instance
        user = new User({
            name,
            email,
            password
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save the user to the database
        await user.save();

        // Generate a JWT for the user
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token to the client
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST route to log in a user
app.post('/api/auth/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token to the client
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




// POST route to create a new farm
const auth = require('./middleware/auth'); // Import the JWT auth middleware

// POST route to create a new farm (protected route)
app.post('/api/farms', auth, async (req, res) => {
    try {
        const { name, location, products, bio, phone, website, photos } = req.body;
        
        const newFarm = new Farm({
            name,
            location,
            products,
            bio,
            phone,
            website,
            photos
        });

        const savedFarm = await newFarm.save();
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
