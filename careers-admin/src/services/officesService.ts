import axios from 'axios';
import { API_URL } from '../config';

export interface Office {
  _id: string;
  id: string;
  name: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOfficeDto {
  name: string;
  address: string;
}

export interface UpdateOfficeDto {
  name?: string;
  address?: string;
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

export const officesService = {
  getAll: async (): Promise<Office[]> => {
    const response = await axios.get(`${API_URL}/company/offices`, getAuthHeaders());
    return response.data;
  },

  get: async (id: string): Promise<Office> => {
    const response = await axios.get(`${API_URL}/company/offices/${id}`, getAuthHeaders());
    return response.data;
  },

  getMain: async (): Promise<Office | null> => {
    const response = await axios.get(`${API_URL}/company/offices/main`, getAuthHeaders());
    return response.data;
  },

  create: async (officeData: CreateOfficeDto): Promise<Office> => {
    const response = await axios.post(`${API_URL}/company/offices`, officeData, getAuthHeaders());
    return response.data;
  },

  update: async (id: string, officeData: UpdateOfficeDto): Promise<Office> => {
    const response = await axios.patch(`${API_URL}/company/offices/${id}`, officeData, getAuthHeaders());
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/company/offices/${id}`, getAuthHeaders());
  }
};
