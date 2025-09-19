import { api } from '../utils/api';
import { InterviewProcess } from './interviewProcessService';

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
  meetingId?: string; // Meeting ID for online meetings
  meetingPassword?: string; // Password for online meetings
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

export interface Consideration {
  id: string;
  title: string;
  description: string;
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
  
  // Get all interviews for an application
  getInterviewsByApplicationId: async (applicationId: string): Promise<Interview[]> => {
    try {
      const response = await api.get<Interview[]>(`/job-applications/${applicationId}/interviews`);
      return response;
    } catch (error: any) {
      // If 404, return empty array
      if (error.message && error.message.includes('not found')) {
        return [];
      }
      console.error(`Error fetching interviews for application ${applicationId}:`, error);
      throw error;
    }
  },

  // Get considerations for a stage
  getConsiderationsByStage: async (stage: string): Promise<Consideration[]> => {
    try {
      // Since there's no direct endpoint for getting considerations by stage,
      // we'll return a set of default considerations based on the stage name
      const defaultConsiderations: { [key: string]: Consideration[] } = {
        'technical': [
          { id: 'tech_knowledge', title: 'Technical Knowledge', description: 'Understanding of core concepts and technologies' },
          { id: 'problem_solving', title: 'Problem Solving', description: 'Ability to solve complex problems efficiently' },
          { id: 'code_quality', title: 'Code Quality', description: 'Writes clean, maintainable code' }
        ],
        'culture': [
          { id: 'team_fit', title: 'Team Fit', description: 'How well the candidate would integrate with the team' },
          { id: 'communication', title: 'Communication Skills', description: 'Ability to communicate ideas clearly and effectively' },
          { id: 'values_alignment', title: 'Values Alignment', description: 'Alignment with company values and culture' }
        ],
        'behavioral': [
          { id: 'leadership', title: 'Leadership', description: 'Demonstrates leadership qualities' },
          { id: 'teamwork', title: 'Teamwork', description: 'Works well with others' },
          { id: 'adaptability', title: 'Adaptability', description: 'Adapts well to changing circumstances' }
        ],
        'system_design': [
          { id: 'architecture', title: 'Architecture', description: 'Ability to design scalable system architectures' },
          { id: 'trade_offs', title: 'Trade-offs', description: 'Understanding of engineering trade-offs' },
          { id: 'scalability', title: 'Scalability', description: 'Designs systems that can scale' }
        ]
      };
      
      // Return default considerations for the stage or an empty array if the stage is not found
      return defaultConsiderations[stage.toLowerCase()] || [];
    } catch (error: any) {
      console.error(`Error fetching considerations for stage ${stage}:`, error);
      return [];
    }
  },
  
  
  // Get feedback by interview ID
  getFeedbackByInterviewId: async (interviewId: string): Promise<InterviewFeedback[]> => {
    try {
      const response = await api.get<InterviewFeedback[]>(`/interviews/${interviewId}/feedback`);
      return response;
    } catch (error: any) {
      // If 404, return empty array
      if (error.message && error.message.includes('not found')) {
        return [];
      }
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
      // If 404, return null - this means no feedback exists yet
      if (error.message && error.message.includes('not found')) {
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
  
  // Update interview details
  updateInterview: async (interviewId: string, interviewData: Partial<Interview>): Promise<Interview> => {
    try {
      const response = await api.put<Interview>(`/interviews/${interviewId}`, interviewData);
      return response;
    } catch (error) {
      console.error('Error updating interview details:', error);
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
  },
  
  // Send reminder to interviewer to submit feedback
  sendFeedbackReminder: async (interviewId: string, interviewerId: string): Promise<void> => {
    try {
      await api.post(`/interviews/${interviewId}/feedback/${interviewerId}/remind`);
    } catch (error) {
      console.error(`Error sending reminder for interview ${interviewId} to interviewer ${interviewerId}:`, error);
      throw error;
    }
  }
};

export default interviewService;
