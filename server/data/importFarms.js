// server/data/importFarms.js

require('dotenv').config();
const mongoose = require('mongoose');
const Farm = require('../models/Farm'); // Verify this path
const farmsData = require('./farmsData');


mongoose.connect(process.env.MONGODB_URI);

async function importData() {
  try {
    await Farm.deleteMany({});
    await Farm.insertMany(farmsData);
    console.log('Data Imported Successfully');
    process.exit();
  } catch (error) {
    console.error('Error Importing Data:', error);
    process.exit(1);
  }
}

importData();
