import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdmin extends Document {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'owner';
  totalEmployees: number;
  totalDevelopers: number;
  totalDesigners: number;
  totalPMs: number;
  totalClients: number;
  totalActiveUsers: number;
  totalProjects: number;
  activeProjects: number;
  blockedProjects: number;
  avgEmployeeRating: number;
  overallClientSatisfaction: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  integrations: string[];
  lastLogin: Date;
  notificationsEnabled: boolean;
  viewSettings: {
    dashboardLayout: string;
    theme: 'light' | 'dark';
  };
}

const adminSchema = new Schema<IAdmin>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['admin', 'owner'],
    default: 'admin',
  },
  totalEmployees: { type: Number, default: 0 },
  totalDevelopers: { type: Number, default: 0 },
  totalDesigners: { type: Number, default: 0 },
  totalPMs: { type: Number, default: 0 },
  totalClients: { type: Number, default: 0 },
  totalActiveUsers: { type: Number, default: 0 },
  totalProjects: { type: Number, default: 0 },
  activeProjects: { type: Number, default: 0 },
  blockedProjects: { type: Number, default: 0 },
  avgEmployeeRating: { type: Number, default: 0 },
  overallClientSatisfaction: { type: Number, default: 0 },
  monthlyRevenue: { type: Number, default: 0 },
  monthlyExpenses: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  integrations: { type: [String], default: [] },
  lastLogin: { type: Date },
  notificationsEnabled: { type: Boolean, default: true },
  viewSettings: {
    dashboardLayout: { type: String, default: 'default' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  },
});

const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin; 