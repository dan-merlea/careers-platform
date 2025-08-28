import axios from 'axios';
import { API_URL } from '../config';

export interface JobFunction {
  _id: string;
  id: string;
  title: string;
  description?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJobFunctionDto {
  title: string;
  description?: string;
  company: string;
}

export interface UpdateJobFunctionDto {
  title?: string;
  description?: string;
  company?: string;
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

export const jobFunctionService = {
  getAll: async (companyId?: string): Promise<JobFunction[]> => {
    const url = companyId 
      ? `${API_URL}/job-functions?companyId=${companyId}` 
      : `${API_URL}/job-functions`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
  },

  get: async (id: string): Promise<JobFunction> => {
    const response = await axios.get(`${API_URL}/job-functions/${id}`, getAuthHeaders());
    return response.data;
  },

  create: async (jobFunctionData: CreateJobFunctionDto): Promise<JobFunction> => {
    const url = `${API_URL}/job-functions`;
    const response = await axios.post(url, jobFunctionData, getAuthHeaders());
    return response.data;
  },

  update: async (id: string, jobFunctionData: UpdateJobFunctionDto): Promise<JobFunction> => {
    const response = await axios.patch(`${API_URL}/job-functions/${id}`, jobFunctionData, getAuthHeaders());
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/job-functions/${id}`, getAuthHeaders());
  }
};
