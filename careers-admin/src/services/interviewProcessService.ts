import { api } from '../utils/api';

export interface Consideration {
  title: string;
  description: string;
}

export interface InterviewStage {
  title: string;
  description: string;
  considerations: Consideration[];
  emailTemplate: string;
  order: number;
  durationMinutes?: number; // Duration in minutes (must be multiple of 15)
}

export interface InterviewProcess {
  id: string;
  name: string;
  description: string;
  jobRole: {
    id: string;
    title: string;
  };
  stages: InterviewStage[];
  company: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InterviewProcessCreateDto {
  name: string;
  description: string;
  jobRoleId: string;
  stages: InterviewStage[];
}

export interface InterviewProcessUpdateDto {
  name?: string;
  description?: string;
  jobRoleId?: string;
  stages?: InterviewStage[];
}

const interviewProcessService = {
  getAllProcesses: async (): Promise<InterviewProcess[]> => {
    const response = await api.get<InterviewProcess[]>('/interview-processes');
    return response;
  },

  getProcessesByJobRole: async (jobRoleId: string): Promise<InterviewProcess[]> => {
    const response = await api.get<InterviewProcess[]>(`/interview-processes/job-role/${jobRoleId}`);
    return response;
  },

  getProcess: async (id: string): Promise<InterviewProcess> => {
    const response = await api.get<InterviewProcess>(`/interview-processes/${id}`);
    return response;
  },

  createProcess: async (processData: InterviewProcessCreateDto): Promise<InterviewProcess> => {
    const response = await api.post<InterviewProcess>('/interview-processes', processData);
    return response;
  },

  updateProcess: async (id: string, processData: InterviewProcessUpdateDto): Promise<InterviewProcess> => {
    const response = await api.put<InterviewProcess>(`/interview-processes/${id}`, processData);
    return response;
  },

  deleteProcess: async (id: string): Promise<void> => {
    await api.delete(`/interview-processes/${id}`);
  }
};

export default interviewProcessService;
