import mongoose, { Document, Schema, Model } from 'mongoose';
import { IDeveloper } from './Developer';

// ProjectManager specific interface
export interface IProjectManager extends IDeveloper {
  managedProjects: mongoose.Types.ObjectId[];
  onTimeDeliveryRate?: number;
  blockerResolutionTime?: number;
  clientSatisfactionScore?: number;
  teamFeedbackScore?: number;
  resourceUtilization?: number;
  projectMetrics?: {
    projectId: mongoose.Types.ObjectId;
    timeline: {
      planned: number; // in days
      actual: number;  // in days
      variance: number; // percentage
    };
    budget: {
      planned: number;
      actual: number;
      variance: number; // percentage
    };
    quality: number; // 0-100
  }[];
}

// Create schema
const projectManagerSchema = new Schema({
  managedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  onTimeDeliveryRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  blockerResolutionTime: {
    type: Number, // Average time in hours
    default: 0,
  },
  clientSatisfactionScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  teamFeedbackScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  resourceUtilization: {
    type: Number, // Percentage
    min: 0,
    max: 100,
    default: 0,
  },
  projectMetrics: [
    {
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
      timeline: {
        planned: Number,
        actual: Number,
        variance: Number,
      },
      budget: {
        planned: Number,
        actual: Number,
        variance: Number,
      },
      quality: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
  ],
});

// Create the ProjectManager model by discriminating the User model
const ProjectManager: Model<IProjectManager> = mongoose.model<IProjectManager>(
  'ProjectManager',
  projectManagerSchema
);

export default ProjectManager; 