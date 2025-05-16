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
  // Enhanced fields
  contacts?: {
    name: string;
    role: string;
    email: string;
    phone?: string;
    isMainContact?: boolean;
  }[];
  billingInfo?: {
    billingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    paymentTerms?: string;
    paymentMethod?: string;
    taxId?: string;
    currency?: string;
    invoiceEmails?: string[];
  };
  feedbackHistory?: {
    date: Date;
    rating: number; // 1-10
    feedback: string;
    projectId?: mongoose.Types.ObjectId;
    respondedTo?: boolean;
  }[];
  contractInfo?: {
    startDate?: Date;
    endDate?: Date;
    renewalDate?: Date;
    contractType?: string;
    contractValue?: number;
    contractFile?: string; // file path or URL
    signedBy?: string;
  };
  communicationPreferences?: {
    preferredChannel?: 'email' | 'phone' | 'video' | 'in-person';
    meetingFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
    timezone?: string;
    availableDays?: string[];
  };
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
    // Enhanced fields
    contacts: [{
      name: {
        type: String,
        required: true,
      },
      role: String,
      email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      },
      phone: String,
      isMainContact: {
        type: Boolean,
        default: false,
      },
    }],
    billingInfo: {
      billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      paymentTerms: String,
      paymentMethod: String,
      taxId: String,
      currency: {
        type: String,
        default: 'USD',
      },
      invoiceEmails: [String],
    },
    feedbackHistory: [{
      date: {
        type: Date,
        default: Date.now,
      },
      rating: {
        type: Number,
        min: 1,
        max: 10,
        required: true,
      },
      feedback: String,
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
      respondedTo: {
        type: Boolean,
        default: false,
      },
    }],
    contractInfo: {
      startDate: Date,
      endDate: Date,
      renewalDate: Date,
      contractType: String,
      contractValue: Number,
      contractFile: String,
      signedBy: String,
    },
    communicationPreferences: {
      preferredChannel: {
        type: String,
        enum: ['email', 'phone', 'video', 'in-person'],
        default: 'email',
      },
      meetingFrequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
        default: 'biweekly',
      },
      timezone: String,
      availableDays: [String],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClient>('Client', ClientSchema); 