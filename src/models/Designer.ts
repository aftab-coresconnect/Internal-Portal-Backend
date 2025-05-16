import mongoose, { Document, Schema, Model } from 'mongoose';
import { IDeveloper } from './Developer';

// Designer specific interface
export interface IDesigner extends IDeveloper {
  toolsUsed: string[];
  figmaProfile?: string;
  clientApprovalRate?: number;
  designPortfolio?: string[];
  completedDesigns?: number;
  designRevisions?: {
    average: number;
    history: {
      projectId: mongoose.Types.ObjectId;
      revisions: number;
    }[];
  };
}

// Create schema
const designerSchema = new Schema({
  toolsUsed: [String],
  figmaProfile: String,
  clientApprovalRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  designPortfolio: [String],
  completedDesigns: {
    type: Number,
    default: 0,
  },
  designRevisions: {
    average: {
      type: Number,
      default: 0,
    },
    history: [
      {
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Project',
        },
        revisions: Number,
      },
    ],
  },
});

// Create the Designer model by discriminating the User model
const Designer: Model<IDesigner> = mongoose.model<IDesigner>(
  'Designer',
  designerSchema
);

export default Designer; 