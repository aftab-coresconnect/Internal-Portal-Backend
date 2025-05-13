import mongoose, { Document, Schema, Model } from 'mongoose';
// Using require for bcrypt since TypeScript declaration file is causing issues
const bcrypt = require('bcrypt');

// Skill interface
interface ISkill {
  name: string;
  level: number;
}

// User interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'developer' | 'teamLead' | 'client';
  avatar: string;
  title: string;
  department: string;
  skills: ISkill[];
  joinedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Create schema
const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
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
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this as IUser;
  
  if (!user.isModified('password')) {
    return next();
  }

  try {
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

// Virtual for full name
userSchema.virtual('fullName').get(function (this: IUser): string {
  return `${this.firstName} ${this.lastName}`;
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User; 