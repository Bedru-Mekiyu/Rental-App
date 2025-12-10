// src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rms';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // stop app if DB fails
  }
};

module.exports = connectDB;
