// Reset passwords for users to fix any double-hashed password issues
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to the database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/internalPortal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Get the User model
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}));

const resetPasswords = async () => {
  try {
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    // For each user, set the password to a known value (or their email)
    let updatedCount = 0;
    
    for (const user of users) {
      // Generate a new hashed password (using their email as the password for simplicity)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update the user
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      updatedCount++;
      console.log(`Updated password for ${user.email}`);
    }

    console.log(`Successfully reset passwords for ${updatedCount} users.`);
    console.log('All users now have "password123" as their password.');
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error in resetPasswords:', error);
    process.exit(1);
  }
};

// Run the script
resetPasswords(); 