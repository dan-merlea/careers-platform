import { api } from '../utils/api';

export interface JobBoard {
  _id: string;
  title: string;
  description?: string;
  isExternal: boolean;
  source: 'greenhouse' | 'ashby' | 'custom';
  externalId?: string;
  settings?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobBoardDto {
  title: string;
  description?: string;
  isExternal?: boolean;
  source?: 'greenhouse' | 'ashby' | 'custom';
  externalId?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateJobBoardDto extends Partial<CreateJobBoardDto> {}

const jobBoardsService = {
  // Get all job boards
  getAllJobBoards: async (): Promise<JobBoard[]> => {
    return api.get<JobBoard[]>('/job-boards');
  },

  // Get job board by ID
  getJobBoardById: async (id: string): Promise<JobBoard> => {
    return api.get<JobBoard>(`/job-boards/${id}`);
  },

  // Create a new job board
  createJobBoard: async (jobBoard: CreateJobBoardDto): Promise<JobBoard> => {
    return api.post<JobBoard>('/job-boards', jobBoard);
  },

  // Update a job board
  updateJobBoard: async (id: string, jobBoard: UpdateJobBoardDto): Promise<JobBoard> => {
    return api.patch<JobBoard>(`/job-boards/${id}`, jobBoard);
  },

  // Delete a job board
  deleteJobBoard: async (id: string): Promise<void> => {
    return api.delete(`/job-boards/${id}`);
  },

  // Create an external job board (Greenhouse or Ashby)
  createExternalJobBoard: async (source: 'greenhouse' | 'ashby'): Promise<JobBoard> => {
    return api.post<JobBoard>(`/job-boards/external/${source}`);
  }
};

export default jobBoardsService;
