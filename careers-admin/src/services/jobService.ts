import { api } from '../utils/api';

export enum JobStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Department {
  id: string;
  name: string;
}

export interface Office {
  id: string;
  name: string;
  location: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Job {
  id: string;
  _id: string; // MongoDB ID
  internalId: string;
  title: string;
  company: Company;
  location: string;
  publishedDate?: string;
  updatedAt: string;
  createdAt: string;
  content: string;
  departments: Department[];
  offices: Office[];
  status: JobStatus;
  jobBoardId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  hiringManager?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  roleId?: string; // Reference to the job role
}

export interface JobCreateDto {
  internalId?: string;
  title: string;
  companyId?: string; // Now optional as it's assigned in the backend
  location: string;
  content: string;
  departmentIds: string[];
  officeIds: string[];
  status?: JobStatus;
  jobBoardId?: string;
  headcountRequestId?: string; // Reference to the headcount request this job is created from
  skipApproval?: boolean; // Flag to skip approval process for jobs created from headcount requests
  roleTitle?: string; // Used for matching with job roles when creating from headcount requests
  hiringManagerId?: string; // Reference to the user who is the hiring manager for this job
  roleId?: string; // Reference to the job role
}

export interface JobUpdateDto {
  internalId?: string;
  title?: string;
  companyId?: string;
  location?: string;
  content?: string;
  departmentIds?: string[];
  officeIds?: string[];
  status?: JobStatus;
  jobBoardId?: string;
  roleTitle?: string; // Used for matching with job roles when creating from headcount requests
  hiringManagerId?: string; // Reference to the user who is the hiring manager for this job
  roleId?: string; // Reference to the job role
}

const jobService = {
  getAllJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs');
    return response;
  },

  getJobsByCompany: async (companyId: string): Promise<Job[]> => {
    const response = await api.get<Job[]>(`/jobs?company=${companyId}`);
    return response;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response;
  },

  createJob: async (jobData: JobCreateDto): Promise<Job> => {
    const response = await api.post<Job>('/jobs', jobData);
    return response;
  },

  updateJob: async (id: string, jobData: JobUpdateDto): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${id}`, jobData);
    return response;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  submitForApproval: async (id: string): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${id}/submit-for-approval`, {});
    return response;
  },

  approveJob: async (id: string): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${id}/approve`, {});
    return response;
  },

  rejectJob: async (id: string, rejectionReason: string): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${id}/reject`, { rejectionReason });
    return response;
  },

  publishJob: async (id: string): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${id}/publish`, {});
    return response;
  },

  archiveJob: async (id: string): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${id}/archive`, {});
    return response;
  },

  getJobsByDepartment: async (departmentId: string): Promise<Job[]> => {
    const response = await api.get<Job[]>(`/jobs/department/${departmentId}`);
    return response;
  },

  getJobsByOffice: async (officeId: string): Promise<Job[]> => {
    const response = await api.get<Job[]>(`/jobs/office/${officeId}`);
    return response;
  },

  getJobsByJobBoard: async (jobBoardId: string): Promise<Job[]> => {
    const response = await api.get<Job[]>(`/jobs/job-board/${jobBoardId}`);
    return response;
  },

  getPendingApprovalJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs/pending-approval');
    return response;
  },

  
  // Create a job from a headcount request
  createJobFromHeadcount: async (headcountRequestId: string, jobData: Partial<JobCreateDto>): Promise<Job> => {
    const data = {
      ...jobData,
      headcountRequestId
      // Let the backend determine if approval should be skipped based on company settings
    };
    // Use the standard jobs endpoint instead of a special endpoint
    const response = await api.post<Job>('/jobs', data);
    return response;
  }
};

export default jobService;
