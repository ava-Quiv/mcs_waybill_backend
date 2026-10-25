// backend/server.js
require('dotenv').config(); // Loads environment variables from the .env file immediately
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configurations
app.use(cors()); 
app.use(express.json()); 

// Connect to MongoDB using your secured .env variable
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error('Error: MONGO_URI is missing from your .env configuration file.');
  process.exit(1);
}

mongoose.connect(dbURI)
  .then(() => console.log('backend succesfully connected to mongo DB Atlas'))
  .catch((err) => console.error('Database connection failed:', err));

// Link your separated routes folder
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Express Application execution online on port ${PORT}`);
});
