import axios from 'axios';
import { API_URL } from '../config';
import { JobFunction } from './jobFunctionService';

export interface JobRole {
  _id: string;
  id: string;
  title: string;
  jobFunction: JobFunction;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJobRoleDto {
  title: string;
  jobFunction: string;
}

export interface UpdateJobRoleDto {
  title?: string;
  jobFunction?: string;
}

const getToken = () => {
  return localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const jobRoleService = {
  getAll: async (jobFunctionId?: string): Promise<JobRole[]> => {
    const url = jobFunctionId 
      ? `${API_URL}/job-roles?jobFunctionId=${jobFunctionId}` 
      : `${API_URL}/job-roles`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
  },

  get: async (id: string): Promise<JobRole> => {
    const response = await axios.get(`${API_URL}/job-roles/${id}`, getAuthHeaders());
    return response.data;
  },

  create: async (jobRoleData: CreateJobRoleDto): Promise<JobRole> => {
    const response = await axios.post(`${API_URL}/job-roles`, jobRoleData, getAuthHeaders());
    return response.data;
  },

  update: async (id: string, jobRoleData: UpdateJobRoleDto): Promise<JobRole> => {
    const response = await axios.patch(`${API_URL}/job-roles/${id}`, jobRoleData, getAuthHeaders());
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/job-roles/${id}`, getAuthHeaders());
  }
};
