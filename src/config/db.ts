import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // Fallback to a default URI if environment variable is not set
    const uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/internal-portal';
    
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

export default connectDB; 