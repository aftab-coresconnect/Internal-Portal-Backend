import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/db';

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database.');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'aftab@coresconnect.com' });
    
    if (adminExists) {
      console.log('Admin user already exists.');
    } else {
      // Create admin user
      const admin = await User.create({
        firstName: 'Aftab',
        lastName: 'Admin',
        email: 'aftab@coresconnect.com',
        password: '123456',
        role: 'admin',
        title: 'System Administrator',
        department: 'IT',
        isActive: true,
      });

      console.log('Admin user created:', admin.email);
    }

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database disconnected.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin(); 