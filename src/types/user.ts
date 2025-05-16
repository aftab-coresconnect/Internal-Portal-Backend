import { Document } from 'mongoose';

// Base user interface with properties common to all user types
export interface IBaseUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Generic user type that can be used for any user model
export type GenericUser = Document & IBaseUser; 