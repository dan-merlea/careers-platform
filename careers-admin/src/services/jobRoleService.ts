import { api } from '../utils/api';
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

// API endpoints
const JOB_ROLES_API = '/job-roles';

export const jobRoleService = {
  /**
   * Get all job roles, optionally filtered by job function
   */
  getAll: (jobFunctionId?: string): Promise<JobRole[]> => {
    const endpoint = jobFunctionId 
      ? `${JOB_ROLES_API}?jobFunctionId=${jobFunctionId}` 
      : JOB_ROLES_API;
    return api.get<JobRole[]>(endpoint);
  },

  /**
   * Get a single job role by ID
   */
  get: (id: string): Promise<JobRole> => {
    return api.get<JobRole>(`${JOB_ROLES_API}/${id}`);
  },

  /**
   * Create a new job role
   */
  create: (jobRoleData: CreateJobRoleDto): Promise<JobRole> => {
    return api.post<JobRole>(JOB_ROLES_API, jobRoleData);
  },

  /**
   * Update an existing job role
   */
  update: (id: string, jobRoleData: UpdateJobRoleDto): Promise<JobRole> => {
    return api.patch<JobRole>(`${JOB_ROLES_API}/${id}`, jobRoleData);
  },

  /**
   * Delete a job role
   */
  delete: (id: string): Promise<void> => {
    return api.delete(`${JOB_ROLES_API}/${id}`);
  }
};
