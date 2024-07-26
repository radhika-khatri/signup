require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const path = require('path');
const connectDB = require('./config/database');
const serviceAccount = require('./authkey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const routes = require('./routes/index')(admin);
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Handle 404 errors
app.use((req, res) => {
  console.log('404 Not Found:', req.originalUrl);
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 5000;  // Changed to 5000 to match the actual running port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;