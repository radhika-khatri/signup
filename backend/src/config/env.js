require('dotenv').config();

const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_BUCKET_NAME',
  'FIREBASE_SERVICE_ACCOUNT',
  'FIREBASE_DATABASE_URL',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is missing`);
  }
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  FIREBASE_SERVICE_ACCOUNT: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};