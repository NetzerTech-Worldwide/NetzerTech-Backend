import { Request } from 'express';
import { User } from '../../entities';
import { UserRole } from '../enums/user-role.enum';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    userType: UserRole;
  } & User;
}

