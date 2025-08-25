import axios from 'axios';
import { API_URL } from '../config';

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
  const response = await axios.post(`${API_URL}/users/login`, credentials);
  return response.data;
};

const signup = async (credentials: SignupCredentials): Promise<User> => {
  const response = await axios.post(`${API_URL}/users/signup`, credentials);
  return response.data;
};

const getAllUsers = async (token: string): Promise<User[]> => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const updateUserRole = async (userId: string, role: UserRole, token: string): Promise<User> => {
  const response = await axios.patch(
    `${API_URL}/users/${userId}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const getProfile = async (token: string): Promise<ProfileResponse> => {
  const response = await axios.get(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const updateProfile = async (data: UpdateProfileRequest, token: string): Promise<ProfileResponse> => {
  const response = await axios.patch(
    `${API_URL}/users/profile`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const changePassword = async (data: ChangePasswordRequest, token: string): Promise<ChangePasswordResponse> => {
  const response = await axios.patch(
    `${API_URL}/users/change-password`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const authService = {
  login,
  signup,
  getAllUsers,
  updateUserRole,
  getProfile,
  updateProfile,
  changePassword
};
