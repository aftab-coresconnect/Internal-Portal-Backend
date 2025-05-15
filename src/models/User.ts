import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Skill interface
interface ISkill {
  name: string;
  level: number;
}

// User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'developer' | 'teamLead' | 'client';
  avatar: string;
  title: string;
  department: string;
  skills: ISkill[];
  joinedAt: Date;
  isActive: boolean;
  effectiveness?: {
    progressScore: number;      // 0–100
    disciplineScore: number;    // 0–100
    communicationScore?: number; // optional, 0–100
    overall: number;            // Weighted average
    notes?: string;             // Optional performance remarks
    lastEvaluated?: Date;       // Timestamp of last evaluation
  };
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Create schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'developer', 'teamLead', 'client'],
      default: 'developer',
    },
    avatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    skills: [
      {
        name: String,
        level: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    effectiveness: {
      progressScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      disciplineScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      communicationScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      overall: {
        type: Number,
        min: 0,
        max: 100,
      },
      notes: String,
      lastEvaluated: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this as IUser;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) {
    return next();
  }

  try {
    // Check if the password is already hashed (usually bcrypt hashes start with $2a$, $2b$ or $2y$)
    if (user.password.match(/^\$2[ayb]\$\d+\$/)) {
      return next(); // Skip hashing if already appears to be hashed
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User; 