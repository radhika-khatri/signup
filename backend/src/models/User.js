const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    sparse: true,
  },
  verificationTokenExpires: {
    type: Date,
  }
});

// Index on verificationToken for faster queries
userSchema.index({ verificationToken: 1, verificationTokenExpires: 1 });

module.exports = mongoose.model('User', userSchema);