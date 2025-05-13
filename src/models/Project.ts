import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  clientName?: string;
  status: 'Active' | 'Paused' | 'Completed';
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
    clientName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Completed'],
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
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
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