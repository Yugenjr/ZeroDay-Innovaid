const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`✅ Ready to test authentication!`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Please whitelist your IP in MongoDB Atlas Network Access');
    process.exit(1);
  }
};

module.exports = connectDB;
