import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import mongoose from 'mongoose';
import connectDB from '../config/db';


const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database.');

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: 'aftab@coresconnect.com' });
    
    if (adminExists) {
      console.log('Admin user already exists. Updating password...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('12345678', salt);
      
      adminExists.password = hashedPassword;
      await adminExists.save();
      
      console.log('Admin password updated successfully.');
    } else {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('12345678', salt);
      
      const admin = await Admin.create({
        name: 'Aftab Admin',
        email: 'aftab@coresconnect.com',
        password: hashedPassword,
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