const mongoose = require('mongoose');

const connectDB = () => {
  const dbURI = 'mongodb+srv://veehive:veehive@atlascluster.0ktshci.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';

  return mongoose.connect(dbURI, {
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