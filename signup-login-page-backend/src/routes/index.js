const express = require('express');
const router = express.Router();
const FirebaseAuthController = require('../controllers/firebase-auth-controller');

const firebaseAuthController = new FirebaseAuthController();

router.post('/register', firebaseAuthController.registerUser.bind(firebaseAuthController));
router.post('/login', firebaseAuthController.loginUser.bind(firebaseAuthController));
router.post('/reset-password', firebaseAuthController.resetPassword.bind(firebaseAuthController));
router.post('/logout', firebaseAuthController.logoutUser.bind(firebaseAuthController));

module.exports = router;