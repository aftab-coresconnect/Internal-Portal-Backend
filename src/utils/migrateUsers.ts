import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db';

/**
 * This script migrates users from the old 'users' collection to the new role-specific collections
 * (developers, projectmanagers, designers, clients)
 * 
 * It also ensures the admin user exists with the specified credentials
 */

const migrateUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database.');

    // Connect directly to the MongoDB collections
    const db = mongoose.connection.db;
    
    // Get collections
    const usersCollection = db.collection('users');
    const developersCollection = db.collection('developers');
    const projectManagersCollection = db.collection('projectmanagers');
    const designersCollection = db.collection('designers');
    const clientsCollection = db.collection('clients');
    
    // Get all users from the old collection
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users in the old 'users' collection`);
    
    // Track counters for migration report
    let adminsCount = 0;
    let developersCount = 0;
    let projectManagersCount = 0;
    let designersCount = 0;
    let clientsCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (const user of users) {
      try {
        // Deep clone the user to avoid modifying the original
        const userData = { ...user };
        
        // Skip if no email (shouldn't happen but just in case)
        if (!userData.email) {
          console.log(`Skipping user with ID ${userData._id} - no email found`);
          skippedCount++;
          continue;
        }
        
        // Remove _id to avoid conflicts (MongoDB will generate a new one)
        const { _id, ...userDataWithoutId } = userData;
        
        // Determine target collection based on role
        switch (userData.role) {
          case 'admin':
            // Check if user already exists
            const adminExists = await developersCollection.findOne({ email: userData.email });
            if (adminExists) {
              console.log(`Admin ${userData.email} already exists, skipping...`);
              skippedCount++;
            } else {
              await developersCollection.insertOne({ ...userDataWithoutId, __v: 0 });
              adminsCount++;
            }
            break;
            
          case 'developer':
          case 'teamLead':
            const developerExists = await developersCollection.findOne({ email: userData.email });
            if (developerExists) {
              console.log(`Developer ${userData.email} already exists, skipping...`);
              skippedCount++;
            } else {
              await developersCollection.insertOne({ ...userDataWithoutId, __v: 0 });
              developersCount++;
            }
            break;
            
          case 'projectManager':
            const managerExists = await projectManagersCollection.findOne({ email: userData.email });
            if (managerExists) {
              console.log(`Project Manager ${userData.email} already exists, skipping...`);
              skippedCount++;
            } else {
              await projectManagersCollection.insertOne({ ...userDataWithoutId, __v: 0 });
              projectManagersCount++;
            }
            break;
            
          case 'designer':
            const designerExists = await designersCollection.findOne({ email: userData.email });
            if (designerExists) {
              console.log(`Designer ${userData.email} already exists, skipping...`);
              skippedCount++;
            } else {
              await designersCollection.insertOne({ ...userDataWithoutId, __v: 0 });
              designersCount++;
            }
            break;
            
          case 'client':
            const clientExists = await clientsCollection.findOne({ email: userData.email });
            if (clientExists) {
              console.log(`Client ${userData.email} already exists, skipping...`);
              skippedCount++;
            } else {
              await clientsCollection.insertOne({ ...userDataWithoutId, __v: 0 });
              clientsCount++;
            }
            break;
            
          default:
            // Default to developer for unknown roles
            const unknownExists = await developersCollection.findOne({ email: userData.email });
            if (unknownExists) {
              console.log(`User with unknown role ${userData.email} already exists, skipping...`);
              skippedCount++;
            } else {
              await developersCollection.insertOne({ ...userDataWithoutId, __v: 0 });
              developersCount++;
            }
        }
      } catch (error) {
        console.error(`Error processing user ${user.email || user._id}:`, error);
        skippedCount++;
      }
    }
    
    // Print migration report
    console.log('\nMigration Report:');
    console.log(`- Admins migrated to 'developers' collection: ${adminsCount}`);
    console.log(`- Developers migrated: ${developersCount}`);
    console.log(`- Project Managers migrated: ${projectManagersCount}`);
    console.log(`- Designers migrated: ${designersCount}`);
    console.log(`- Clients migrated: ${clientsCount}`);
    console.log(`- Skipped (already exists or errors): ${skippedCount}`);
    console.log(`- Total migrated: ${adminsCount + developersCount + projectManagersCount + designersCount + clientsCount}`);
    
    // Check for admin user with specific credentials
    const adminEmail = 'aftab@coresconnect.com';
    const adminExists = await developersCollection.findOne({ email: adminEmail });
    
    if (adminExists) {
      console.log(`\nAdmin user ${adminEmail} already exists. Updating password...`);
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('12345678', salt);
      
      // Update the admin's password
      await developersCollection.updateOne(
        { email: adminEmail },
        { $set: { password: hashedPassword, name: 'Aftab Admin', role: 'admin' } }
      );
      
      console.log('Admin password updated.');
    } else {
      console.log(`\nAdmin user ${adminEmail} not found. Creating...`);
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('12345678', salt);
      
      // Create admin user
      await developersCollection.insertOne({
        name: 'Aftab Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        title: 'System Administrator',
        department: 'IT',
        isActive: true,
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      });
      
      console.log('Admin user created.');
    }
    
    console.log('\nMigration completed successfully!');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

// Run the migration
migrateUsers(); 