const admin = require('firebase-admin');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

class FirebaseAuthController {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'radzoo2004@gmail.com',
        pass: 'qrsz qsmw gqzr btil'  // App password
      }
    });
  }

  async registerUser(req, res) {
    const { email, password } = req.body;
    console.log(`Attempting to register user with email: ${email}`);
    
    try {
      // Check if user already exists in Firebase
      try {
        const firebaseUser = await admin.auth().getUserByEmail(email);
        // User exists in Firebase, check if they exist in MongoDB
        let mongoUser = await User.findOne({ email: email });
        if (!mongoUser) {
          // User exists in Firebase but not in MongoDB, create MongoDB entry
          mongoUser = new User({
            email: email,
            firebaseUid: firebaseUser.uid,
            isVerified: firebaseUser.emailVerified
          });
          await mongoUser.save();
          console.log(`Created MongoDB entry for existing Firebase user: ${mongoUser._id}`);
        }

        if (!firebaseUser.emailVerified) {
          // User exists but email is not verified, send verification email
          const link = await admin.auth().generateEmailVerificationLink(email);
          await this.sendVerificationEmail(email, link);
          console.log(`Verification email sent to existing user: ${email}`);
          return res.status(200).json({ message: "User already registered. A new verification email has been sent. Please check your email to verify your account." });
        } else {
          return res.status(400).json({ error: "Email already in use and verified. Please login or reset your password if you forgot it." });
        }
      } catch (firebaseError) {
        if (firebaseError.code !== 'auth/user-not-found') {
          throw firebaseError;
        }
        // User not found in Firebase, proceed with registration
      }

      // Create user in Firebase
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        emailVerified: false
      });

      // Create user in MongoDB
      const newUser = new User({
        email: email,
        firebaseUid: userRecord.uid,
        isVerified: false
      });
      await newUser.save();
      console.log(`User created in MongoDB: ${newUser._id}`);

      // Send verification email
      const link = await admin.auth().generateEmailVerificationLink(email);
      await this.sendVerificationEmail(email, link);
      console.log(`Verification email sent to new user: ${email}`);

      res.status(201).json({ message: "User registered successfully. Please check your email to verify your account." });
    } catch (error) {
      console.error(`Error in registerUser: ${error}`);
      res.status(500).json({ error: "An error occurred while registering user", details: error.message });
    }
  }

  async loginUser(req, res) {
    const { email, password } = req.body;
    console.log(`Attempting to log in user with email: ${email}`);

    try {
      // Authenticate with Firebase
      const userCredential = await admin.auth().getUserByEmail(email);

      // Check if user exists in MongoDB
      let user = await User.findOne({ email: email });
      if (!user) {
        // If user exists in Firebase but not in MongoDB, create MongoDB entry
        user = new User({
          email: email,
          firebaseUid: userCredential.uid,
          isVerified: userCredential.emailVerified
        });
        await user.save();
        console.log(`User created in MongoDB for existing Firebase user: ${user._id}`);
      }

      // Update verification status in MongoDB if it differs from Firebase
      if (user.isVerified !== userCredential.emailVerified) {
        user.isVerified = userCredential.emailVerified;
        await user.save();
      }

      if (!user.isVerified) {
        // Send a new verification email
        const link = await admin.auth().generateEmailVerificationLink(email);
        await this.sendVerificationEmail(email, link);
        console.log(`Verification email sent to unverified user: ${email}`);
        return res.status(401).json({ error: "Email not verified. A new verification email has been sent. Please check your email to verify your account." });
      }

      console.log(`User logged in successfully: ${user.firebaseUid}`);
      res.status(200).json({ message: "User logged in successfully", uid: user.firebaseUid });
    } catch (error) {
      console.error(`Error in loginUser: ${error}`);
      res.status(401).json({ error: "Invalid email or password" });
    }
  }

  async sendVerificationEmail(email, link) {
    console.log(`Sending verification email to: ${email}`);
    try {
      await this.transporter.sendMail({
        from: '"Your App" <radzoo2004@gmail.com>',
        to: email,
        subject: "Verify your email",
        text: `Please verify your email by clicking this link: ${link}`,
        html: `<p>Please verify your email by clicking this link: <a href="${link}">Verify Email</a></p>`
      });
      console.log(`Verification email sent successfully to: ${email}`);
    } catch (error) {
      console.error(`Error sending verification email to ${email}: ${error.message}`);
      throw error;
    }
  }

  async resetPassword(req, res) {
    const { email } = req.body;
    console.log(`Attempting to reset password for email: ${email}`);
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
      await user.save();
  
      const resetLink = `http://localhost:3000/reset-password/${resetToken}`; // Update this URL to match your frontend
  
      await this.transporter.sendMail({
        from: '"Your App" <radzoo2004@gmail.com>',
        to: email,
        subject: "Reset your password",
        text: `Click this link to reset your password: ${resetLink}`,
        html: `<p>Click this link to reset your password: <a href="${resetLink}">Reset Password</a></p>`
      });
      console.log(`Password reset email sent successfully to: ${email}`);
      res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (error) {
      console.error(`Error in resetPassword for email ${email}: ${error.message}`);
      res.status(500).json({ error: "An error occurred while resetting password" });
    }
  }

  async completeResetPassword(req, res) {
    const { token, newPassword } = req.body;
    
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: "Password reset token is invalid or has expired" });
      }

      await admin.auth().updateUser(user.firebaseUid, {
        password: newPassword
      });

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error(`Error in completeResetPassword: ${error.message}`);
      res.status(500).json({ error: "An error occurred while resetting password" });
    }
  }

  async logoutUser(req, res) {
    console.log('Logout request received');
    res.status(200).json({ message: "User logged out successfully" });
  }
}

module.exports = FirebaseAuthController;