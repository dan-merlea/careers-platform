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

  // Update application status
  updateApplicationStatus: async (id: string, status: JobApplicant['status']): Promise<JobApplicant> => {
    const response = await api.put<JobApplicant>(`/job-applications/${id}/status`, { status });
    return response;
  },

  // Get URL for resume download
  getResumeDownloadUrl: (applicantId: string): string => {
    return `${API_URL}/job-applications/${applicantId}/resume`;
  },
  
  // Download resume directly
  downloadResume: async (applicantId: string): Promise<void> => {
    try {
      // Create a hidden anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // Get the auth token
      const token = getAuthToken();
      
      // Fetch the resume with proper authentication
      const response = await fetch(`${API_URL}/job-applications/${applicantId}/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download resume: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'resume';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Set the anchor's href and download attributes
      a.href = url;
      a.download = filename;
      
      // Trigger the download
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      throw error;
    }
  },
  
  // Get resume content as a blob URL for in-browser display
  getResumeContentUrl: async (applicantId: string): Promise<{ url: string, mimeType: string }> => {
    try {
      // Get the auth token
      const token = getAuthToken();
      
      // Fetch the resume with proper authentication
      const response = await fetch(`${API_URL}/job-applications/${applicantId}/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get resume content: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Return the URL and mime type
      return {
        url,
        mimeType: blob.type
      };
    } catch (error) {
      console.error('Error getting resume content:', error);
      throw error;
    }
  }
};

export default jobApplicationService;
