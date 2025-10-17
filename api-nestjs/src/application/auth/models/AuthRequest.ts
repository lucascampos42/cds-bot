import { Request } from 'express';
import { User } from '../../../generated/prisma-client';

export interface AuthRequest extends Request {
  user: User;
}
