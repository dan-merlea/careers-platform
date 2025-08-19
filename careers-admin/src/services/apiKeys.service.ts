import { api } from '../utils/api';

export enum IntegrationType {
  GREENHOUSE = 'greenhouse',
  ASHBY = 'ashby',
}

export interface ApiKey {
  _id: string;
  userId: string;
  type: IntegrationType;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  companyId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyDto {
  type: IntegrationType;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  companyId?: string;
}

export const apiKeysService = {
  /**
   * Get all API keys for the current user
   */
  async getAll(): Promise<ApiKey[]> {
    const response = await api.get<ApiKey[]>('/api-keys');
    return response;
  },

  /**
   * Get API key by integration type
   */
  async getByType(type: IntegrationType): Promise<ApiKey> {
    const response = await api.get<ApiKey>(`/api-keys/${type}`);
    return response;
  },

  /**
   * Create or update an API key
   */
  async saveApiKey(data: CreateApiKeyDto): Promise<ApiKey> {
    const response = await api.post<ApiKey>('/api-keys', data);
    return response;
  },

  /**
   * Delete an API key
   */
  async deleteApiKey(id: string): Promise<void> {
    await api.delete(`/api-keys/${id}`);
  }
};
