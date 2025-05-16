import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Skill interface
interface ISkill {
  name: string;
  level: number;
}

// Project reference interface for user's current projects
interface IProjectReference {
  project: mongoose.Types.ObjectId;
  role: string;
}

// Developer interface (previously User)
export interface IDeveloper extends Document {
  name: string;
  email: string;
  password: string;
  role: 'developer';
  avatar: string;
  title: string;
  department: string;
  skills: ISkill[];
  joinedAt: Date;
  isActive: boolean;
  lastActive?: Date;
  lastLogin?: Date;
  designation?: string;
  currentProjects?: IProjectReference[];
  // Developer specific fields
  techStack?: string[];
  githubProfile?: string;
  bugsResolved?: number;
  codeQualityScore?: number;
  pullRequestsCompleted?: number;
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
const developerSchema = new Schema<IDeveloper>(
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
      enum: ['admin', 'developer', 'designer', 'projectManager', 'teamLead', 'client'],
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
    lastActive: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    designation: {
      type: String,
      default: '',
    },
    currentProjects: [
      {
        project: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Project',
        },
        role: {
          type: String,
          default: 'contributor',
        },
      },
    ],
    // Developer specific fields
    techStack: [String],
    githubProfile: String,
    bugsResolved: {
      type: Number,
      default: 0,
    },
    codeQualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    pullRequestsCompleted: {
      type: Number,
      default: 0,
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
developerSchema.pre('save', async function (next) {
  const developer = this as IDeveloper;
  
  // Only hash the password if it's modified or new
  if (!developer.isModified('password')) {
    return next();
  }

  try {
    // Check if the password is already hashed (usually bcrypt hashes start with $2a$, $2b$ or $2y$)
    if (developer.password.match(/^\$2[ayb]\$\d+\$/)) {
      return next(); // Skip hashing if already appears to be hashed
    }

    const salt = await bcrypt.genSalt(10);
    developer.password = await bcrypt.hash(developer.password, salt);
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

// Method to compare password
developerSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Developer: Model<IDeveloper> = mongoose.model<IDeveloper>('Developer', developerSchema);

export default Developer; 