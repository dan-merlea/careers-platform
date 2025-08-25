import axios from 'axios';
import { API_URL } from '../config';

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
}

export interface JobCreateDto {
  internalId?: string;
  title: string;
  companyId: string;
  location: string;
  content: string;
  departmentIds: string[];
  officeIds: string[];
  status?: JobStatus;
  jobBoardId?: string;
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
}

const jobService = {
  getAllJobs: async (): Promise<Job[]> => {
    const response = await axios.get(`${API_URL}/jobs`, getAuthHeaders());
    return response.data;
  },

  getJobsByCompany: async (companyId: string): Promise<Job[]> => {
    const response = await axios.get(`${API_URL}/jobs?company=${companyId}`, getAuthHeaders());
    return response.data;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await axios.get(`${API_URL}/jobs/${id}`, getAuthHeaders());
    return response.data;
  },

  createJob: async (jobData: JobCreateDto): Promise<Job> => {
    const response = await axios.post(`${API_URL}/jobs`, jobData, getAuthHeaders());
    return response.data;
  },

  updateJob: async (id: string, jobData: JobUpdateDto): Promise<Job> => {
    const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, getAuthHeaders());
    return response.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/jobs/${id}`, getAuthHeaders());
  },

  submitForApproval: async (id: string): Promise<Job> => {
    const response = await axios.put(`${API_URL}/jobs/${id}/submit-for-approval`, {}, getAuthHeaders());
    return response.data;
  },

  approveJob: async (id: string): Promise<Job> => {
    const response = await axios.put(`${API_URL}/jobs/${id}/approve`, {}, getAuthHeaders());
    return response.data;
  },

  rejectJob: async (id: string, rejectionReason: string): Promise<Job> => {
    const response = await axios.put(`${API_URL}/jobs/${id}/reject`, { rejectionReason }, getAuthHeaders());
    return response.data;
  },

  publishJob: async (id: string): Promise<Job> => {
    const response = await axios.put(`${API_URL}/jobs/${id}/publish`, {}, getAuthHeaders());
    return response.data;
  },

  archiveJob: async (id: string): Promise<Job> => {
    const response = await axios.put(`${API_URL}/jobs/${id}/archive`, {}, getAuthHeaders());
    return response.data;
  },

  getJobsByDepartment: async (departmentId: string): Promise<Job[]> => {
    const response = await axios.get(`${API_URL}/jobs/department/${departmentId}`, getAuthHeaders());
    return response.data;
  },

  getJobsByOffice: async (officeId: string): Promise<Job[]> => {
    const response = await axios.get(`${API_URL}/jobs/office/${officeId}`, getAuthHeaders());
    return response.data;
  },

  getJobsByJobBoard: async (jobBoardId: string): Promise<Job[]> => {
    const response = await axios.get(`${API_URL}/jobs/job-board/${jobBoardId}`, getAuthHeaders());
    return response.data;
  },

  getPendingApprovalJobs: async (): Promise<Job[]> => {
    const response = await axios.get(`${API_URL}/jobs/pending-approval`, getAuthHeaders());
    return response.data;
  },

  getJobsForApproval: async (role: string): Promise<Job[]> => {
    const response = await axios.get(`${API_URL}/jobs/for-approval?role=${role}`, getAuthHeaders());
    return response.data;
  }
};

export default jobService;
