import { api } from '../utils/api';

export enum UserRole {
  ADMIN = 'admin',
  DIRECTOR = 'director',
  MANAGER = 'manager',
  RECRUITER = 'recruiter',
  USER = 'user'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProfileResponse extends User {
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/users/login', credentials);
};

const signup = async (credentials: SignupCredentials): Promise<User> => {
  return api.post<User>('/users/signup', credentials);
};

const getAllUsers = async (token: string): Promise<User[]> => {
  // token is handled automatically by the api utility
  return api.get<User[]>('/users');
};

const updateUserRole = async (userId: string, role: UserRole, token: string): Promise<User> => {
  // token is handled automatically by the api utility
  return api.patch<User>(`/users/${userId}/role`, { role });
};

const updateUserDepartment = async (userId: string, departmentId: string | null, token: string): Promise<User> => {
  // token is handled automatically by the api utility
  return api.patch<User>(`/users/${userId}/department`, { departmentId });
};

const getProfile = async (token: string): Promise<ProfileResponse> => {
  // token is handled automatically by the api utility
  return api.get<ProfileResponse>('/users/profile');
};

const updateProfile = async (data: UpdateProfileRequest, token: string): Promise<ProfileResponse> => {
  // token is handled automatically by the api utility
  return api.patch<ProfileResponse>('/users/profile', data);
};

const changePassword = async (data: ChangePasswordRequest, token: string): Promise<ChangePasswordResponse> => {
  // token is handled automatically by the api utility
  return api.patch<ChangePasswordResponse>('/users/change-password', data);
};

export const authService = {
  login,
  signup,
  getAllUsers,
  updateUserRole,
  updateUserDepartment,
  getProfile,
  updateProfile,
  changePassword
};
