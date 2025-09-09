import { api } from '../utils/api';
import { UserRole } from './auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}

/**
 * Fetch all users with manager, director, or admin roles
 * @returns Promise with array of users
 */
const getHiringManagers = async (): Promise<User[]> => {
  const users = await api.get<User[]>('/users');
  
  // Filter users to only include managers, directors, and admins
  return users.filter(user => 
    user.role === UserRole.MANAGER || 
    user.role === UserRole.DIRECTOR || 
    user.role === UserRole.ADMIN
  );
};

export const userService = {
  getHiringManagers
};
