import { api } from '../utils/api';

export interface JobTemplate {
  id: string;
  name: string;
  content: string;
  role: string;
  department?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobTemplateRequest {
  name: string;
  content: string;
  role: string;
  departmentId?: string;
}

export interface UpdateJobTemplateRequest {
  name?: string;
  content?: string;
  role?: string;
  departmentId?: string;
}

const jobTemplateService = {
  getAll: async (): Promise<JobTemplate[]> => {
    const response = await api.get<JobTemplate[]>('/job-templates');
    return response;
  },

  getByRole: async (role: string): Promise<JobTemplate[]> => {
    const response = await api.get<JobTemplate[]>(`/job-templates/role/${role}`);
    return response;
  },

  getById: async (id: string): Promise<JobTemplate> => {
    const response = await api.get<JobTemplate>(`/job-templates/${id}`);
    return response;
  },

  create: async (template: CreateJobTemplateRequest): Promise<JobTemplate> => {
    const response = await api.post<JobTemplate>('/job-templates', template);
    return response;
  },

  update: async (id: string, template: UpdateJobTemplateRequest): Promise<JobTemplate> => {
    const response = await api.patch<JobTemplate>(`/job-templates/${id}`, template);
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/job-templates/${id}`);
  }
};

export default jobTemplateService;
