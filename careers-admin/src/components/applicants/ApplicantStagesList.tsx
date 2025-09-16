import React, { useState, useEffect } from 'react';
import { CheckIcon, ArrowRightIcon, XMarkIcon, CalendarIcon, UserIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import EmailTemplateModal from '../modals/EmailTemplateModal';
import InterviewScheduleModal from '../modals/InterviewScheduleModal';
import { api } from '../../utils/api';
import { API_URL } from '../../config';

interface Stage {
  id: string;
  title: string;
  order: number;
  emailTemplate?: string;
}

interface Interviewer {
  userId: string;
  name: string;
}

interface Interview {
  id: string;
  scheduledDate: string;
  title: string;
  description?: string;
  interviewers: Interviewer[];
  stage: string;
  status: string;
  cancellationReason?: string;
  processId?: string; // ID of the interview process this interview belongs to
  createdAt: string;
  updatedAt: string;
}

interface ApplicantStagesListProps {
  stages: Stage[];
  currentStage: string;
  onStageChange: (stageId: string) => void;
  applicantName: string;
  jobTitle?: string;
  applicationId: string;
  candidateEmail: string;
  processId?: string; // Interview process ID
}

const ApplicantStagesList: React.FC<ApplicantStagesListProps> = ({
  stages,
  currentStage,
  onStageChange,
  applicantName,
  jobTitle,
  applicationId,
  candidateEmail,
  processId
}) => {
  // State for email template modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  
  // State for interview scheduling modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  
  // State for interviews
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(''); // Used in handleCancelInterview and handleRescheduleInterview
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [newScheduledDate, setNewScheduledDate] = useState<string>('');

  // Sort stages by order
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  
  // Find the index of the current stage
  const currentStageIndex = sortedStages.findIndex(stage => stage.id === currentStage);
  
  // Fetch interviews when component mounts or applicationId changes
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!applicationId) return;
      
      setIsLoadingInterviews(true);
      setInterviewError(null);
      
      try {
        const interviewsData = await api.get<Interview[]>(`/job-applications/${applicationId}/interviews`);
        setInterviews(interviewsData);
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setInterviewError('Failed to load interview data');
      } finally {
        setIsLoadingInterviews(false);
      }
    };
    
    fetchInterviews();
  }, [applicationId]);
  
  // Handle stage change with email
  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };
  
  // Handle interview scheduling
  const handleScheduleInterview = () => {
    setIsInterviewModalOpen(true);
  };
  
  // Handle interview scheduled
  const handleInterviewScheduled = () => {
    // Refresh interviews
    const fetchInterviews = async () => {
      try {
        const interviewsData = await api.get<Interview[]>(`/job-applications/${applicationId}/interviews`);
        setInterviews(interviewsData);
      } catch (err) {
        console.error('Error fetching interviews:', err);
      }
    };
    
    fetchInterviews();
  };
  
  // Handle cancel interview
  const handleCancelInterview = async () => {
    if (!selectedInterviewId || !cancelReason.trim()) return;
    
    setIsCanceling(true);
    
    try {
      await api.put(`/interviews/${selectedInterviewId}/cancel`, { reason: cancelReason });
      setShowCancelModal(false);
      setCancelReason('');
      
      // Refresh interviews
      const interviewsData = await api.get<Interview[]>(`/job-applications/${applicationId}/interviews`);
      setInterviews(interviewsData);
    } catch (err) {
      console.error('Error cancelling interview:', err);
      alert('Failed to cancel interview. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };
  
  // Handle reschedule interview
  const handleRescheduleInterview = async () => {
    if (!selectedInterviewId || !newScheduledDate) return;
    
    setIsRescheduling(true);
    
    try {
      await api.put(`/interviews/${selectedInterviewId}/reschedule`, { scheduledDate: newScheduledDate });
      setShowRescheduleModal(false);
      setNewScheduledDate('');
      
      // Refresh interviews
      const interviewsData = await api.get<Interview[]>(`/job-applications/${applicationId}/interviews`);
      setInterviews(interviewsData);
    } catch (err) {
      console.error('Error rescheduling interview:', err);
      alert('Failed to reschedule interview. Please try again.');
    } finally {
      setIsRescheduling(false);
    }
  };
  
  // Handle downloading interview invite
  const handleDownloadInvite = async (interviewId: string) => {
    try {
      // Use the api utility to get the authenticated response
      const response = await fetch(
        `${API_URL}/job-applications/${applicationId}/interviews/${interviewId}/invite`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'interview_invite.ics');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading interview invite:', error);
      alert('Failed to download interview invite. Please try again.');
    }
  };
  
  // Handle email send and update stage
  const handleSendEmail = (emailContent: string) => {
    console.log('Email content to send:', emailContent);
    console.log('Moving applicant to stage:', selectedStage?.id);
    
    if (selectedStage) {
      onStageChange(selectedStage.id);
    }
  };
  
  // Handle skip email and just update stage
  const handleSkipEmail = () => {
    if (selectedStage) {
      onStageChange(selectedStage.id);
    }
    setIsModalOpen(false);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6 mb-8 relative">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Application Progress</h3>
        
        {/* Vertical timeline line */}
        <div className="absolute left-10 top-20 bottom-6 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-8">
          {sortedStages.map((stage, index) => {
            // Determine if this stage is completed, current, or upcoming
            const isCompleted = index < currentStageIndex;
            const isCurrent = stage.id === currentStage;
            const isNext = index === currentStageIndex + 1;
            const isRejected = stage.id === 'rejected';
            
            // Determine the appropriate colors for this stage
            let bgColor, textColor, borderColor, iconBg;
            
            if (isCompleted) {
              bgColor = 'bg-green-50';
              textColor = 'text-green-800';
              borderColor = 'border-green-200';
              iconBg = 'bg-green-500';
            } else if (isCurrent) {
              bgColor = 'bg-blue-50';
              textColor = 'text-blue-800';
              borderColor = 'border-blue-200';
              iconBg = 'bg-blue-500';
            } else if (isRejected) {
              bgColor = 'bg-red-50';
              textColor = 'text-red-800';
              borderColor = 'border-red-200';
              iconBg = 'bg-red-500';
            } else {
              bgColor = 'bg-gray-50';
              textColor = 'text-gray-800';
              borderColor = 'border-gray-200';
              iconBg = 'bg-gray-500';
            }
            
            return (
              <div key={stage.id} className="relative pl-10">
                {/* Stage indicator circle */}
                <div 
                  className={`absolute left-0 top-0 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${iconBg} text-white shadow-sm`}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : isRejected ? (
                    <XMarkIcon className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Stage content */}
                <div className={`ml-4 p-2 px-4 rounded-lg border ${borderColor} ${bgColor}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${textColor}`}>
                      {stage.title}
                    </h4>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    {/* Description or status */}
                    <div className="text-xs text-gray-500">
                      {isCompleted ? 'Completed' : isCurrent ? 'Current Stage' : ''}
                    </div>
                    
                    {/* Show interviews for this stage */}
                    {interviews.filter(interview => interview.stage === stage.id).length > 0 && (
                      <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100">
                        <div className="font-medium text-blue-800 flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          Interviews
                        </div>
                        {interviews
                          .filter(interview => interview.stage === stage.id)
                          .map(interview => (
                            <div key={interview.id} className="mt-1">
                              <div className="flex items-center">
                                <ClockIcon className="w-3 h-3 mr-1 text-blue-600" />
                                <span>{formatDate(interview.scheduledDate)} {formatTime(interview.scheduledDate)}</span>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {/* Next stage button */}
                    {isNext && !isCompleted && !isCurrent && (
                      <button
                        onClick={() => handleStageClick(stage)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ArrowRightIcon className="w-4 h-4 mr-1.5" />
                        Move to this stage
                      </button>
                    )}
                    
                    {/* Schedule interview button for current stage only, excluding specific stages */}
                    {isCurrent && !['new', 'reviewed', 'hired'].includes(stage.id) && (
                      <button
                        onClick={handleScheduleInterview}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CalendarIcon className="w-4 h-4 mr-1.5" />
                        Schedule Interview
                      </button>
                    )}
                    
                    {/* Skip button for stages after next */}
                    {index > currentStageIndex + 1 && (
                      <button
                        onClick={() => handleStageClick(stage)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Skip to this stage
                      </button>
                    )}
                    
                    {/* Return button for previous stages */}
                    {isCompleted && (
                      <button
                        onClick={() => handleStageClick(stage)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Return to this stage
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming interviews section - show at the top for all stages */}
      {interviews.length > 0 && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Scheduled Interviews
          </h4>
          
          {isLoadingInterviews ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : interviewError ? (
            <div className="text-red-600 text-sm">{interviewError}</div>
          ) : interviews.length === 0 ? (
            <div className="text-gray-500 text-sm">No interviews scheduled yet</div>
          ) : (
            <div className="space-y-3">
              {interviews.map((interview) => (
                <div key={interview.id} className={`${interview.status === 'cancelled' ? 'bg-red-50 border-red-100' : 'bg-white border-blue-100'} border rounded-md p-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Link to={`/interview/${interview.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                          {interview.title}
                        </Link>
                        {interview.status === 'cancelled' && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-md">
                            CANCELLED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {formatDate(interview.scheduledDate)}
                        <ClockIcon className="w-4 h-4 ml-2 mr-1" />
                        {formatTime(interview.scheduledDate)}
                      </div>
                      {interview.status === 'cancelled' && interview.cancellationReason && (
                        <div className="mt-1 text-xs text-red-600">
                          <span className="font-medium">Reason:</span> {interview.cancellationReason}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {interview.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleDownloadInvite(interview.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                          Calendar Invite
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {interview.description && (
                    <p className="text-sm text-gray-600 mt-2">{interview.description}</p>
                  )}
                  
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 mr-2">Interviewers:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {interview.interviewers.map((interviewer) => (
                        <span 
                          key={interviewer.userId} 
                          className="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                        >
                          <UserIcon className="w-3 h-3 mr-1" />
                          {interviewer.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    {interview.status !== 'cancelled' && (
                      <Link 
                        to={`/interview/${interview.id}`}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Only show Schedule Another Interview button for stages that allow interviews */}
          {!['new', 'reviewed', 'hired'].includes(currentStage) && (
            <button
              onClick={handleScheduleInterview}
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CalendarIcon className="w-4 h-4 mr-1.5" />
              Schedule Another Interview
            </button>
          )}
        </div>
      )}
      
      {/* Email Template Modal */}
      {selectedStage && (
        <EmailTemplateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSend={handleSendEmail}
          onSkip={handleSkipEmail}
          stage={selectedStage}
          applicantName={applicantName}
          jobTitle={jobTitle}
        />
      )}
      
      {/* Interview Schedule Modal */}
      <InterviewScheduleModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        applicationId={applicationId}
        candidateName={applicantName}
        candidateEmail={candidateEmail}
        onScheduled={handleInterviewScheduled}
        processId={processId}
      />
      
      {/* Cancel Interview Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cancel Interview</h3>
            <p className="mb-4 text-gray-600">Are you sure you want to cancel this interview? This action cannot be undone.</p>
            
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 h-24"
                placeholder="Please provide a reason for cancellation..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelInterview}
                disabled={isCanceling || !cancelReason.trim()}
                className={`px-4 py-2 rounded-md text-white ${isCanceling || !cancelReason.trim() ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} flex items-center`}
              >
                {isCanceling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reschedule Interview Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reschedule Interview</h3>
            <p className="mb-4 text-gray-600">Please select a new date and time for this interview.</p>
            
            <div className="mb-4">
              <label htmlFor="newScheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                New Date and Time *
              </label>
              <input
                type="datetime-local"
                id="newScheduledDate"
                value={newScheduledDate}
                onChange={(e) => setNewScheduledDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleInterview}
                disabled={isRescheduling || !newScheduledDate}
                className={`px-4 py-2 rounded-md text-white ${isRescheduling || !newScheduledDate ? 'bg-amber-400' : 'bg-amber-600 hover:bg-amber-700'} flex items-center`}
              >
                {isRescheduling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicantStagesList;
