import { api } from '../utils/api';
import { InterviewProcess, Consideration } from './interviewProcessService';

export interface Interviewer {
  userId: string;
  name: string;
}

export interface Interview {
  id: string;
  scheduledDate: string;
  title: string;
  description?: string;
  interviewers: Interviewer[];
  stage: string;
  status: string;
  cancellationReason?: string; // Reason for cancellation if status is 'cancelled'
  createdAt: string;
  updatedAt: string;
  applicantId: string;
  applicantName: string;
  jobTitle: string;
  location?: string;
  onlineMeetingUrl?: string;
  processId?: string; // ID of the interview process this interview belongs to
}

export interface InterviewFeedback {
  id?: string;
  interviewId: string;
  interviewerId: string;
  interviewerName: string;
  rating: number;
  comments: string;
  decision: 'definitely_no' | 'no' | 'yes' | 'definitely_yes' | '';
  considerations: { [key: string]: number };
  createdAt?: string;
  updatedAt?: string;
}

const interviewService = {
  // Get all interviews for active applicants
  getActiveInterviews: async (): Promise<Interview[]> => {
    try {
      const response = await api.get<Interview[]>('/interviews/active');
      return response;
    } catch (error) {
      console.error('Error fetching active interviews:', error);
      throw error;
    }
  },

  // Get all upcoming interviews
  getUpcomingInterviews: async (): Promise<Interview[]> => {
    try {
      const response = await api.get<Interview[]>('/interviews/upcoming');
      return response;
    } catch (error) {
      console.error('Error fetching upcoming interviews:', error);
      throw error;
    }
  },

  // Get interview details by ID
  getInterviewById: async (id: string): Promise<Interview> => {
    try {
      const response = await api.get<Interview>(`/interviews/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching interview with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get interview process details for an interview
  getInterviewProcess: async (processId: string): Promise<InterviewProcess> => {
    try {
      const response = await api.get<InterviewProcess>(`/interview-processes/${processId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching interview process with ID ${processId}:`, error);
      throw error;
    }
  },
  
  // Get feedback for an interview
  getInterviewFeedback: async (interviewId: string): Promise<InterviewFeedback[]> => {
    try {
      const response = await api.get<InterviewFeedback[]>(`/interviews/${interviewId}/feedback`);
      return response;
    } catch (error) {
      console.error(`Error fetching feedback for interview ${interviewId}:`, error);
      throw error;
    }
  },
  
  // Get feedback by interviewer
  getInterviewerFeedback: async (interviewId: string, interviewerId: string): Promise<InterviewFeedback | null> => {
    try {
      const response = await api.get<InterviewFeedback>(`/interviews/${interviewId}/feedback/${interviewerId}`);
      return response;
    } catch (error: any) {
      // If 404, return null
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error(`Error fetching feedback for interviewer ${interviewerId}:`, error);
      throw error;
    }
  },
  
  // Submit feedback for an interview
  submitFeedback: async (feedback: InterviewFeedback): Promise<InterviewFeedback> => {
    try {
      const response = await api.post<InterviewFeedback>(`/interviews/${feedback.interviewId}/feedback`, feedback);
      return response;
    } catch (error) {
      console.error('Error submitting interview feedback:', error);
      throw error;
    }
  },
  
  // Update feedback for an interview
  updateFeedback: async (feedback: InterviewFeedback): Promise<InterviewFeedback> => {
    try {
      const response = await api.put<InterviewFeedback>(
        `/interviews/${feedback.interviewId}/feedback/${feedback.interviewerId}`, 
        feedback
      );
      return response;
    } catch (error) {
      console.error('Error updating interview feedback:', error);
      throw error;
    }
  },

  // Cancel an interview
  cancelInterview: async (interviewId: string, reason: string): Promise<Interview> => {
    try {
      const response = await api.put<Interview>(`/interviews/${interviewId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error(`Error canceling interview ${interviewId}:`, error);
      throw error;
    }
  },

  // Reschedule an interview
  rescheduleInterview: async (interviewId: string, scheduledDate: string): Promise<Interview> => {
    try {
      const response = await api.put<Interview>(`/interviews/${interviewId}/reschedule`, { scheduledDate });
      return response;
    } catch (error) {
      console.error(`Error rescheduling interview ${interviewId}:`, error);
      throw error;
    }
  },

  // Update interviewers for an interview
  updateInterviewers: async (interviewId: string, interviewers: Interviewer[]): Promise<Interview> => {
    try {
      const response = await api.put<Interview>(`/interviews/${interviewId}/interviewers`, { interviewers });
      return response;
    } catch (error) {
      console.error(`Error updating interviewers for interview ${interviewId}:`, error);
      throw error;
    }
  }
};

export default interviewService;
