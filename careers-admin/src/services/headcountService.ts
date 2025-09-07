import { api } from '../utils/api';

export interface HeadcountRequest {
  _id: string;
  role: string;
  department: string;
  teamName: string;
  reason: string;
  location?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  jobId?: string; // Reference to the job created from this headcount request
  hasJobCreated?: boolean; // Flag to indicate if a job has been created from this request
}

export interface CreateHeadcountRequest {
  role: string;
  department: string;
  teamName: string;
  reason: string;
}

const headcountService = {
  // Get all headcount requests
  getAll: async (): Promise<HeadcountRequest[]> => {
    return api.get<HeadcountRequest[]>('/headcount-requests');
  },

  // Get a single headcount request by ID
  getById: async (id: string): Promise<HeadcountRequest> => {
    return api.get<HeadcountRequest>(`/headcount-requests/${id}`);
  },

  // Create a new headcount request
  create: async (headcountData: CreateHeadcountRequest): Promise<HeadcountRequest> => {
    return api.post<HeadcountRequest>('/headcount-requests', headcountData);
  },

  // Update an existing headcount request
  update: async (id: string, headcountData: Partial<CreateHeadcountRequest>): Promise<HeadcountRequest> => {
    return api.patch<HeadcountRequest>(`/headcount-requests/${id}`, headcountData);
  },

  // Approve a headcount request
  approve: async (id: string, reviewNotes?: string): Promise<HeadcountRequest> => {
    return api.post<HeadcountRequest>(`/headcount-requests/${id}/approve`, { reviewNotes });
  },

  // Reject a headcount request
  reject: async (id: string, reviewNotes?: string): Promise<HeadcountRequest> => {
    return api.post<HeadcountRequest>(`/headcount-requests/${id}/reject`, { reviewNotes });
  },

  // Delete a headcount request
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(`/headcount-requests/${id}`);
  },
  
  // Create a job from an approved headcount request
  createJobFromHeadcount: async (headcountId: string): Promise<{ jobId: string }> => {
    return api.post<{ jobId: string }>(`/headcount-requests/${headcountId}/create-job`, {});
  },
  
  // Mark a headcount request as having a job created
  markJobCreated: async (headcountId: string, jobId: string): Promise<HeadcountRequest> => {
    return api.patch<HeadcountRequest>(`/headcount-requests/${headcountId}`, { jobId, hasJobCreated: true });
  },
  
  // Get all approved headcount requests that don't have jobs created yet
  getApprovedWithoutJobs: async (): Promise<HeadcountRequest[]> => {
    return api.get<HeadcountRequest[]>('/headcount-requests/approved-without-jobs');
  },
};

export default headcountService;
