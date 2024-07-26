const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const logger = require('../utils/logger');

class AuthService {
  async createUser(email, password, displayName) {
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
      });
      logger.info(`User created: ${userRecord.uid}`);
      return userRecord;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw error;
    }
  }

  createJWT(uid) {
    return jwt.sign({ uid }, JWT_SECRET, { expiresIn: '1d' });
  }
}

module.exports = new AuthService();