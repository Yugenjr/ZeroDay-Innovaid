const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('📍 Connection String:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('🏢 Host:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔌 Ready State:', mongoose.connection.readyState);
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('ConnectionTest', testSchema);
    
    const testDoc = new TestModel({
      message: 'InnovAid connection test successful!'
    });
    
    await testDoc.save();
    console.log('📝 Test document created successfully!');
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up!');
    
    console.log('\n🎉 Database is ready for InnovAid!');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Troubleshooting Tips:');
      console.log('1. Check your username and password');
      console.log('2. Ensure your IP is whitelisted in MongoDB Atlas');
      console.log('3. Verify the database user has proper permissions');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network Issue:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the cluster URL is correct');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
  }
};

testConnection();
