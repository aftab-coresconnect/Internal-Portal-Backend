import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: mongoose.Types.ObjectId[];
  dependencies?: mongoose.Types.ObjectId[];
  progressPercentage: number;
  notes?: string[];
  attachments?: { name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Milestone description is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Delayed'],
      default: 'Not Started',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    completedDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    }],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notes: [{
      type: String,
    }],
    attachments: [{
      name: { type: String },
      url: { type: String },
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMilestone>('Milestone', MilestoneSchema); 