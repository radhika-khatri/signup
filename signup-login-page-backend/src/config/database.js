const mongoose = require('mongoose');

const connectDB = () => {
  return mongoose.connect('mongodb://localhost:27017/loginsignup', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
};

module.exports = connectDB;