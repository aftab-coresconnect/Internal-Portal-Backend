import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../src/models/Admin';
import connectDB from '../src/config/db';


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/internal-portal';

async function createAdmin() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database.');

    const email = 'aftab@coresconnect.com';
    const password = '12345678';
    const name = 'Aftab';
    const userId = 'admin-001';

    // Check if admin already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', existing);
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
      userId,
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      totalEmployees: 0,
      totalDevelopers: 0,
      totalDesigners: 0,
      totalPMs: 0,
      totalClients: 0,
      totalActiveUsers: 0,
      totalProjects: 0,
      activeProjects: 0,
      blockedProjects: 0,
      avgEmployeeRating: 0,
      overallClientSatisfaction: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      netProfit: 0,
      integrations: ['Jira', 'Google Meet'],
      lastLogin: new Date(),
      notificationsEnabled: true,
      viewSettings: {
        dashboardLayout: 'default',
        theme: 'light',
      },
    };

    console.log('Admin data to be saved:', adminData);

    const admin = new Admin(adminData);

    await admin.save();
    console.log('Admin user created:', admin);

    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();