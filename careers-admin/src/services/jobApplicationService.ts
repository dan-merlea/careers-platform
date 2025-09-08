import { api, getAuthToken } from '../utils/api';
import { API_URL } from '../config';

export interface JobApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  resumeFilename?: string; // Name of the resume file
  createdAt: string; // Date when the application was created
  updatedAt: string; // Date when the application was last updated
  status: 'new' | 'reviewed' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  jobId: string;
}

const jobApplicationService = {
  // Get all applications for a specific job
  getApplicationsByJobId: async (jobId: string): Promise<JobApplicant[]> => {
    const response = await api.get<JobApplicant[]>(`/job-applications/job/${jobId}`);
    return response;
  },

  // Get a specific application by ID
  getApplication: async (id: string): Promise<JobApplicant> => {
    const response = await api.get<JobApplicant>(`/job-applications/${id}`);
    return response;
  },

  // Note: The server doesn't currently support updating application status
  // This is a client-side only implementation for UI demonstration purposes
  updateApplicationStatus: (id: string, status: JobApplicant['status']): JobApplicant => {
    console.log(`Status update for application ${id} to ${status} (server endpoint not implemented)`);
    // Return a mock response with the updated status
    return {
      id,
      status,
      // Other fields will be populated by the component that has the full applicant data
    } as JobApplicant;
  },

  // Download resume
  getResumeDownloadUrl: (applicantId: string): string => {
    const token = getAuthToken();
    return `${API_URL}/job-applications/${applicantId}/resume?token=${token}`;
  }
};

export default jobApplicationService;
