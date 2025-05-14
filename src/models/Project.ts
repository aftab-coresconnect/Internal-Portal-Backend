import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  clientId: mongoose.Types.ObjectId;               // Reference to Client model
  clientName: string;                              // Client's name for quick access
  status: 'Active' | 'Paused' | 'Completed' | 'Delivered';
  priority?: 'High' | 'Medium' | 'Low';
  startDate: Date;
  deadline: Date;
  figmaLink?: string;
  repoLink?: string;
  jiraLink?: string;
  techStack: string[];
  assignedDevelopers: mongoose.Types.ObjectId[];
  projectManager?: mongoose.Types.ObjectId;
  milestones?: mongoose.Types.ObjectId[];
  tags?: string[];
  budget?: number;
  spentBudget?: number;
  progressPercent?: number;
  satisfaction?: {
    quality?: number;         // 1 to 5 stars
    communication?: number;   // 1 to 5 stars
    timeliness?: number;      // 1 to 5 stars
    overall?: number;         // 1 to 5 stars
    reviewNote?: string;      // Optional feedback
  };
  notes?: string[];
  attachments?: { name: string; url: string }[];
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client reference is required'],
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Completed', 'Delivered'],
      default: 'Active',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    figmaLink: {
      type: String,
      default: '',
    },
    repoLink: {
      type: String,
      default: '',
    },
    jiraLink: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      set: (v: string | Date) => typeof v === 'string' ? new Date(v) : v
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
      set: (v: string | Date) => typeof v === 'string' ? new Date(v) : v
    },
    techStack: [{
      type: String,
    }],
    assignedDevelopers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    milestones: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    }],
    tags: [{
      type: String,
    }],
    budget: {
      type: Number,
      default: 0,
    },
    spentBudget: {
      type: Number,
      default: 0,
    },
    progressPercent: {
      type: Number,
      default: 0,
    },
    satisfaction: {
      quality: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      timeliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      overall: {
        type: Number,
        min: 1,
        max: 5,
      },
      reviewNote: String,
    },
    notes: [{
      type: String,
    }],
    attachments: [{
      name: { type: String },
      url: { type: String },
    }],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>('Project', ProjectSchema); 