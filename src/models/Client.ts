import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  linkedProjects?: mongoose.Types.ObjectId[]; // Array of related Project IDs
  notes?: string[];
  painPoints?: string[]; // Captures key client frustrations/needs
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
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
    phone: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    linkedProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
    notes: [{
      type: String,
    }],
    painPoints: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClient>('Client', ClientSchema); 