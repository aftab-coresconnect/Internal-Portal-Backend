import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface TokenData {
  id: string;
  iat: number;
  exp: number;
} 