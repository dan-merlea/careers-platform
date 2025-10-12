import { api } from '../utils/api';

export interface CompanyApiKey {
  id: string;
  apiKey: string;
  name: string;
  description?: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyApiKeyDto {
  name: string;
  description?: string;
}

export interface GenerateApiKeyResponse {
  apiKey: CompanyApiKey;
  secretKey: string;
  warning: string;
}

const companyApiKeysService = {
  generate: async (data: CreateCompanyApiKeyDto): Promise<GenerateApiKeyResponse> => {
    return api.post<GenerateApiKeyResponse>('/company-api-keys', data);
  },

  getAll: async (): Promise<CompanyApiKey[]> => {
    return api.get<CompanyApiKey[]>('/company-api-keys');
  },

  getOne: async (id: string): Promise<CompanyApiKey> => {
    return api.get<CompanyApiKey>(`/company-api-keys/${id}`);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/company-api-keys/${id}`);
  },

  toggleActive: async (id: string): Promise<CompanyApiKey> => {
    return api.patch<CompanyApiKey>(`/company-api-keys/${id}/toggle`);
  },
};

export default companyApiKeysService;
