import { api, getAuthToken } from '../utils/api';
import { API_URL } from '../config';

// Valid application status values from the server
export enum ApplicationStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  CONTACTED = 'contacted',
  INTERVIEWING = 'interviewing',
  DEBRIEF = 'debrief',
  OFFERED = 'offered',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

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
  status: string;
  jobId: string;
  interviewerVisibility?: boolean; // Whether interviewers can see each other's feedback
  refereeId?: string; // ID of the user who referred this applicant
  refereeName?: string; // Name of the user who referred this applicant
  refereeEmail?: string; // Email of the user who referred this applicant
  refereeRelationship?: string; // Description of how the referee knows the applicant and why they're a good fit
  isReferral?: boolean; // Whether this applicant was referred
  source?: string; // Source of the application (referral, linkedin, careers-page, etc.)
}

export interface Note {
  id?: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReferralRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  consentDuration: number;
  jobId: string;
  refereeId: string;
  refereeRelationship?: string;
  source?: string;
  resume: File;
}

const jobApplicationService = {
  // Get all applications for a specific job
  getApplicationsByJobId: async (jobId: string): Promise<JobApplicant[]> => {
    const response = await api.get<JobApplicant[]>(`/job-applications/job/${jobId}`);
    return response;
  },

  // Get all referrals made by the current user
  getUserReferrals: async (): Promise<JobApplicant[]> => {
    const response = await api.get<JobApplicant[]>('/job-applications/referrals');
    return response;
  },

  // Get a specific application by ID
  getApplication: async (id: string): Promise<JobApplicant> => {
    try {
      const response = await api.get<JobApplicant>(`/job-applications/${id}`);
      return response;
    } catch (error: any) {
      // If we get a 403 error, try the interviewer access endpoint
      if (error.response && error.response.status === 403) {
        return jobApplicationService.getApplicationAsInterviewer(id);
      }
      throw error;
    }
  },
  
  // Get a specific application by ID as an interviewer
  getApplicationAsInterviewer: async (id: string): Promise<JobApplicant> => {
    const response = await api.get<JobApplicant>(`/job-applications/${id}/interviewer-access`);
    return response;
  },

  // Update application status
  updateApplicationStatus: async (id: string, status: string): Promise<JobApplicant> => {
    const response = await api.put<JobApplicant>(`/job-applications/${id}/status`, { status });
    return response;
  },
  
  // Update interviewer visibility
  updateInterviewerVisibility: async (id: string, visibility: boolean): Promise<JobApplicant> => {
    const response = await api.put<JobApplicant>(`/job-applications/${id}/interviewer-visibility`, { visibility });
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
  },
  
  // Get notes for an applicant (only returns notes created by the current user)
  getNotes: async (applicantId: string): Promise<Note[]> => {
    try {
      const response = await api.get<Note[]>(`/job-applications/${applicantId}/notes`);
      return response;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },
  
  // Add a note to an applicant
  addNote: async (applicantId: string, content: string): Promise<Note> => {
    try {
      const response = await api.post<Note>(`/job-applications/${applicantId}/notes`, { content });
      return response;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },
  
  // Update a note
  updateNote: async (applicantId: string, noteIndex: number, content: string): Promise<Note> => {
    try {
      const response = await api.patch<Note>(`/job-applications/${applicantId}/notes/${noteIndex}`, { content });
      return response;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },
  
  // Delete a note
  deleteNote: async (applicantId: string, noteIndex: number): Promise<void> => {
    try {
      await api.delete(`/job-applications/${applicantId}/notes/${noteIndex}`);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },
  
  // Create a referral
  createReferral: async (referralData: CreateReferralRequest): Promise<JobApplicant> => {
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      
      // Append the resume file
      formData.append('resume', referralData.resume);
      
      // Append all other fields
      formData.append('firstName', referralData.firstName);
      formData.append('lastName', referralData.lastName);
      formData.append('email', referralData.email);
      if (referralData.phone) formData.append('phone', referralData.phone);
      if (referralData.linkedin) formData.append('linkedin', referralData.linkedin);
      if (referralData.website) formData.append('website', referralData.website);
      if (referralData.refereeRelationship) formData.append('refereeRelationship', referralData.refereeRelationship);
      // Set source to 'referral' by default or use the provided value
      formData.append('source', referralData.source || 'referral');
      formData.append('consentDuration', referralData.consentDuration.toString());
      formData.append('jobId', referralData.jobId);
      formData.append('refereeId', referralData.refereeId);
      
      // Send the request
      // Don't set Content-Type header for FormData - browser will set it correctly with boundary
      const response = await api.post<JobApplicant>('/job-applications/referral', formData);
      
      return response;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }
};

export default jobApplicationService;
