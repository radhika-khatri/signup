const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

module.exports = function(admin) {
  const router = express.Router();

  // Middleware to verify JWT
  const verifyToken = (req, res, next) => {
    console.log('Verifying token...');
    const token = req.cookies.token;
    if (!token) {
      console.log('No token provided');
      return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      console.log('Token verified successfully. User ID:', decoded.id);
      req.userId = decoded.id;
      next();
    });
  };

  // Create or update user
  router.post('/create-user', async (req, res) => {
    console.log('Received create/update user request');
    try {
      const { idToken } = req.body;
      
      console.log('Verifying Firebase ID token...');
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, email_verified } = decodedToken;
      console.log('Firebase ID token verified for user:', email);

      let user = await User.findOne({ firebaseUid: uid });
      
      if (user) {
        console.log('Updating existing user:', email);
        user.email = email;
        user.isVerified = email_verified;
      } else {
        console.log('Creating new user:', email);
        user = new User({
          email,
          firebaseUid: uid,
          isVerified: email_verified
        });
      }

      await user.save();
      console.log('User saved successfully');

      let verificationSent = true;
      if (!email_verified) {
        console.log('Sending email verification...');
        try {
          await admin.auth().generateEmailVerificationLink(email);
          console.log('Email verification sent');
        } catch (verificationError) {
          console.error('Error sending verification email:', verificationError);
          verificationSent = false;
        }
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: 86400 // 24 hours
      });
      console.log('JWT token generated');

      res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // 24 hours
      console.log('JWT token set in cookie');

      res.status(200).json({ 
        message: 'User created/updated successfully', 
        user: { email: user.email, firebaseUid: user.firebaseUid, isVerified: user.isVerified },
        verificationSent
      });
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ error: 'An error occurred while creating/updating user', details: error.message });
    }
  });

  // Login user
  router.post('/login', async (req, res) => {
    console.log('Received login request');
    try {
      const { idToken } = req.body;
      
      console.log('Verifying Firebase ID token...');
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, email_verified } = decodedToken;
      console.log('Firebase ID token verified for user:', email);

      let user = await User.findOne({ firebaseUid: uid });

      if (!user) {
        console.log('User not found in database, creating new user:', email);
        user = new User({
          email,
          firebaseUid: uid,
          isVerified: email_verified
        });
        await user.save();
      }

      if (user.isVerified !== email_verified) {
        console.log('Updating user verification status');
        user.isVerified = email_verified;
        await user.save();
      }

      if (!email_verified) {
        console.log('Email not verified.');
        return res.status(403).json({ error: 'Email not verified', message: 'Please check your email for verification link' });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: 86400 // 24 hours
      });
      console.log('JWT token generated');

      res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // 24 hours
      console.log('JWT token set in cookie');

      res.status(200).json({ message: 'Login successful', user: { email: user.email, firebaseUid: user.firebaseUid, isVerified: user.isVerified } });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'An error occurred while logging in', details: error.message });
    }
  });

  // Logout user
  router.post('/logout', (req, res) => {
    console.log('Received logout request');
    res.clearCookie('token');
    console.log('JWT token cookie cleared');
    res.status(200).json({ message: 'Logged out successfully' });
  });

  // Protected route example
  router.get('/protected', verifyToken, (req, res) => {
    console.log('Accessed protected route');
    res.status(200).json({ message: 'This is a protected route' });
  });

  return router;
};