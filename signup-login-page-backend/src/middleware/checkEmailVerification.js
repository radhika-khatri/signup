const admin = require('firebase-admin');

const checkEmailVerification = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    
    if (!user.emailVerified) {
      return res.status(403).json({ error: "Email not verified. Please check your email for the verification link." });
    }
    
    next();
  } catch (error) {
    console.error(`Error checking email verification: ${error.message}`);
    res.status(500).json({ error: "An error occurred while checking email verification" });
  }
};

module.exports = checkEmailVerification;