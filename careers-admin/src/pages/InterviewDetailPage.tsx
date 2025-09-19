import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import EditInterviewersModal from '../components/modals/EditInterviewersModal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/QuillEditor.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ResumePage from './ResumePage';
import TabNavigation from '../components/common/TabNavigation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConsiderationsEditor from '../components/interviews/ConsiderationsEditor';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon, 
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import interviewService, { Interview, Interviewer } from '../services/interviewService';
import jobApplicationService, { JobApplicant } from '../services/jobApplicationService';
import { formatDate, formatTime } from '../utils/dateUtils';
import { toast } from 'react-toastify';

// Define the feedback interface
interface InterviewFeedback {
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


const InterviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userEmail, name, userId } = useAuth();
  
  // State for interview data
  const [interview, setInterview] = useState<Interview | null>(null);
  const [applicant, setApplicant] = useState<JobApplicant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get tab from URL query params or default to 'info'
  const getTabFromUrl = useCallback((): 'candidate' | 'resume' | 'feedback' | 'info' => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    if (tabParam === 'resume' || tabParam === 'feedback' || tabParam === 'candidate') {
      return tabParam;
    }
    return 'info';
  }, [location.search]);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState<'candidate' | 'resume' | 'feedback' | 'info'>(getTabFromUrl());
  
  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.search, getTabFromUrl]);
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'candidate' | 'resume' | 'feedback' | 'info');
    navigate(`/interview/${id}?tab=${tabId}`, { replace: true });
  };
  
  // State to track if current user is an interviewer for this interview
  const [isInterviewer, setIsInterviewer] = useState<boolean>(false);
  
  // State for modals
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [showEditInterviewersModal, setShowEditInterviewersModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [newScheduledDate, setNewScheduledDate] = useState<string>('');
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [isUpdatingInterviewers, setIsUpdatingInterviewers] = useState<boolean>(false);
  
  // State for feedback
  const [feedback, setFeedback] = useState<InterviewFeedback>({
    interviewId: id || '',
    interviewerId: '', // Will be set from the current user
    interviewerName: '', // Will be set from the current user
    rating: 0,
    comments: '',
    decision: '',
    considerations: {},
  });
  const [isSavingFeedback, setIsSavingFeedback] = useState<boolean>(false);
  const [hasExistingFeedback, setHasExistingFeedback] = useState<boolean>(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState<boolean>(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
  
  // State for interview stage considerations - now managed by ConsiderationsEditor

  // Fetch interview data
  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch interview details
        const interviewData = await interviewService.getInterviewById(id);
        setInterview(interviewData);
        
        // Check if current user is an interviewer for this interview based on userId
        const isUserInterviewer = interviewData.interviewers.some(interviewer => interviewer.userId === userId);        
        setIsInterviewer(isUserInterviewer);
  
        // Try to find the current user in the interviewers list based on userId
        const currentInterviewer = interviewData.interviewers.find(interviewer => interviewer.userId === userId);
        
        if (currentInterviewer) {
          console.log('Found current interviewer:', currentInterviewer);
          setFeedback(prev => ({
            ...prev,
            interviewerId: currentInterviewer.userId,
            interviewerName: currentInterviewer.name
          }));
          
          // Fetch existing feedback for this interviewer
          if (isUserInterviewer && currentInterviewer.userId) {
            setIsLoadingFeedback(true);
            try {
              const existingFeedback = await interviewService.getInterviewerFeedback(id, currentInterviewer.userId);
              if (existingFeedback) {
                setFeedback(existingFeedback);
                setHasExistingFeedback(true);
                setIsEditingFeedback(false);
              } else {
                setHasExistingFeedback(false);
                setIsEditingFeedback(true);
              }
            } catch (error) {
              console.error('Error fetching existing feedback:', error);
              setHasExistingFeedback(false);
              setIsEditingFeedback(true);
            } finally {
              setIsLoadingFeedback(false);
            }
          }
        } else {
          // If user is not in the interviewers list, use their email as ID and name from auth context
          console.log('User not found in interviewers list, using current user info');
          setFeedback(prev => ({
            ...prev,
            interviewerId: userId || userEmail || '',
            interviewerName: name || userEmail || 'Anonymous User',
          }));
        }
        
        // Fetch applicant details
        if (interviewData.applicantId) {
          const applicantData = await jobApplicationService.getApplication(interviewData.applicantId);
          setApplicant(applicantData);
        }
        
      } catch (err) {
        console.error('Error fetching interview data:', err);
        setError('Failed to load interview data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterviewData();
  }, [id, userEmail, name, userId, location.search]); // Include location.search to react to URL changes
  
  // Resume is now handled by the ResumePage component
  
  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({
      ...prev,
      rating
    }));
  };
  
  // Handle decision change
  const handleDecisionChange = (decision: InterviewFeedback['decision']) => {
    setFeedback(prev => ({
      ...prev,
      decision
    }));
  };
  
  // Handle comments change
  const handleCommentsChange = (content: string) => {
    setFeedback(prev => ({
      ...prev,
      comments: content
    }));
  };
  
  // Handle cancel feedback editing
  const handleCancelFeedbackEditing = () => {
    // If there's existing feedback, fetch it again to reset any changes
    if (hasExistingFeedback && id && interview) {
      setIsLoadingFeedback(true);
      interviewService.getInterviewerFeedback(id, feedback.interviewerId)
        .then(existingFeedback => {
          if (existingFeedback) {
            setFeedback(existingFeedback);
            setIsEditingFeedback(false);
          }
        })
        .catch(error => {
          console.error('Error fetching existing feedback:', error);
          toast.error('Failed to cancel editing. Please try again.');
        })
        .finally(() => {
          setIsLoadingFeedback(false);
        });
    } else {
      // If there's no existing feedback, just reset the form
      setIsEditingFeedback(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
  
  // Check if interview has already passed
  const isInterviewPassed = (dateString: string) => {
    const interviewDate = new Date(dateString);
    const currentDate = new Date();
    return interviewDate < currentDate;
  };
  
  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (!id) {
      toast.error('Interview ID is missing');
      return;
    }
    
    console.log('Submitting feedback with considerations:', feedback.considerations);
    
    // Validate feedback
    // For HTML content, we need to check if it contains any text after removing HTML tags
    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    
    if (!feedback.decision) {
      toast.error('Please select a decision');
      return;
    }
    
    if (!stripHtml(feedback.comments)) {
      toast.error('Please provide comments');
      return;
    }
    
    setIsSavingFeedback(true);
    
    try {
      // The API will handle creating new or updating existing feedback
      let result: InterviewFeedback;
      
      // Ensure we have the applicantId to prevent ObjectId errors
      if (!applicant || !applicant.id) {
        throw new Error('Cannot submit feedback: Missing applicant ID');
      }
      
      // Add applicantId to the feedback object and ensure interview ID is set correctly
      const feedbackWithApplicant = {
        ...feedback,
        interviewId: id, // Ensure the interview ID is set correctly
        applicantId: applicant.id // Add the applicantId to prevent ObjectId errors
      };
      
      try {
        // Try to submit new feedback
        result = await interviewService.submitFeedback(feedbackWithApplicant);
        console.log('API response from submitFeedback:', result);
        console.log('API response considerations:', result.considerations);
        toast.success('Feedback submitted successfully');
      } catch (submitError: any) {
        // If submission fails with a conflict error, try updating instead
        if (submitError.message && submitError.message.includes('already exists')) {
          // Update existing feedback with applicantId and ensure interview ID is set correctly
          const feedbackToUpdate = {
            ...feedbackWithApplicant,
            interviewId: id // Ensure the interview ID is set correctly
          };
          
          result = await interviewService.updateFeedback(feedbackToUpdate);
          console.log('API response from updateFeedback:', result);
          console.log('API response considerations:', result.considerations);
          toast.success('Feedback updated successfully');
        } else {
          // Re-throw if it's not a conflict error
          throw submitError;
        }
      }
      
      // Update the local state with the saved feedback
      // Make sure to preserve the considerations mapping
      console.log('Before updating feedback state, current considerations:', feedback.considerations);
      
      // Log the API response for debugging
      console.log('API response result:', result);
      console.log('API response considerations:', result.considerations);
      
      // Create a new feedback object that preserves our consideration ratings
      const updatedFeedback = {
        ...result,
        considerations: { ...feedback.considerations } // Use a copy of our current considerations
      };
      
      console.log('Setting feedback to:', updatedFeedback);
      console.log('With considerations:', updatedFeedback.considerations);
      
      // Update the feedback state with our preserved considerations
      setFeedback(updatedFeedback);
      
      // Show the feedback display instead of the form
      setHasExistingFeedback(true);
      setIsEditingFeedback(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSavingFeedback(false);
    }
  };
  
  // Handle cancel interview
  const handleCancelInterview = async () => {
    if (!id || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    setIsCanceling(true);
    
    try {
      await interviewService.cancelInterview(id, cancelReason);
      toast.success('Interview cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      
      // Refresh interview data
      const updatedInterview = await interviewService.getInterviewById(id);
      setInterview(updatedInterview);
    } catch (err) {
      console.error('Error cancelling interview:', err);
      toast.error('Failed to cancel interview. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };
  
  // Handle reschedule interview
  const handleRescheduleInterview = async () => {
    if (!id || !newScheduledDate) {
      toast.error('Please select a new date and time');
      return;
    }
    
    // Check if interview has already passed
    if (interview && isInterviewPassed(interview.scheduledDate)) {
      toast.error('Cannot reschedule an interview that has already passed');
      return;
    }
    
    // Check if new date is in the past
    const newDate = new Date(newScheduledDate);
    if (newDate < new Date()) {
      toast.error('Cannot reschedule an interview to a past date');
      return;
    }
    
    setIsRescheduling(true);
    
    try {
      await interviewService.rescheduleInterview(id, newScheduledDate);
      toast.success('Interview rescheduled successfully');
      setShowRescheduleModal(false);
      setNewScheduledDate('');
      
      // Refresh interview data
      const updatedInterview = await interviewService.getInterviewById(id);
      setInterview(updatedInterview);
    } catch (err) {
      console.error('Error rescheduling interview:', err);
      toast.error('Failed to reschedule interview. Please try again.');
    } finally {
      setIsRescheduling(false);
    }
  };
  
  // Handle update interviewers
  const handleUpdateInterviewers = async (interviewers: Interviewer[]) => {
    if (!id) return;
    
    // Check if interview has already passed
    if (interview && isInterviewPassed(interview.scheduledDate)) {
      toast.error('Cannot modify interviewers for an interview that has already passed');
      return;
    }
    
    setIsUpdatingInterviewers(true);
    
    try {
      await interviewService.updateInterviewers(id, interviewers);
      toast.success('Interviewers updated successfully');
      setShowEditInterviewersModal(false);
      
      // Refresh interview data
      const updatedInterview = await interviewService.getInterviewById(id);
      setInterview(updatedInterview);
    } catch (err) {
      console.error('Error updating interviewers:', err);
      toast.error('Failed to update interviewers. Please try again.');
    } finally {
      setIsUpdatingInterviewers(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" message="Loading interview details..." />
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Render when no interview found
  if (!interview) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Interview not found.
        </div>
      </div>
    );
  }
  
  // At this point, interview is guaranteed to be non-null
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {interview.title}
              </h1>
              {interview.status === 'cancelled' && (
                <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-md">
                  CANCELLED
                </span>
              )}
            </div>
            {interview.status === 'cancelled' && interview.cancellationReason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Cancellation reason:</span> {interview.cancellationReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left and center columns - Tabs and content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <TabNavigation
                tabs={[
                  {
                    id: 'info',
                    label: 'Candidate Information',
                    icon: <UserIcon className="w-5 h-5" />
                  },
                  {
                    id: 'resume',
                    label: 'Resume',
                    icon: <DocumentTextIcon className="w-5 h-5" />
                  },
                  ...(isInterviewer ? [
                    {
                      id: 'feedback',
                      label: 'Provide Feedback',
                      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    }
                  ] : [])
                ]}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                className="px-4"
              />
            </div>
            
            {/* Tab content */}
            <div className="p-6">
              {/* Candidate Information Tab */}
              {activeTab === 'info' && applicant && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                    {applicant.firstName} {applicant.lastName}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">{applicant.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <p className="font-medium">{applicant.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <span className="text-sm text-gray-500">Applied For:</span>
                      <p className="font-medium">{interview.jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Application Date:</span>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="font-medium">{formatDate(applicant.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Resume Tab */}
              {activeTab === 'resume' && applicant && applicant.id ? (
                <ResumePage id={applicant.id} />
              ) : activeTab === 'resume' && (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-gray-600">No resume available</p>
                </div>
              )}
              
              {/* Feedback Tab */}
              {activeTab === 'feedback' && isInterviewer && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-600" />
                      {hasExistingFeedback && !isEditingFeedback ? 'Your Feedback' : 'Interview Feedback'}
                    </div>
                    {hasExistingFeedback && !isEditingFeedback && (
                      <button
                        type="button"
                        onClick={() => setIsEditingFeedback(true)}
                        className="text-sm bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit Feedback
                      </button>
                    )}
                  </h2>
                  
                  {isLoadingFeedback ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : hasExistingFeedback && !isEditingFeedback ? (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2">Overall Rating</h3>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              <StarIcon className="h-6 w-6" />
                            </span>
                          ))}
                          <span className="ml-2 text-gray-600">
                            {feedback.rating > 0 ? `${feedback.rating} out of 5` : 'No rating'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2">Decision</h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                          ${feedback.decision === 'definitely_yes' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${feedback.decision === 'yes' ? 'bg-green-100 text-green-800' : ''}
                          ${feedback.decision === 'no' ? 'bg-orange-100 text-orange-800' : ''}
                          ${feedback.decision === 'definitely_no' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {feedback.decision === 'definitely_yes' && 'Definitely Yes'}
                          {feedback.decision === 'yes' && 'Yes'}
                          {feedback.decision === 'no' && 'No'}
                          {feedback.decision === 'definitely_no' && 'Definitely No'}
                          {!feedback.decision && 'No decision'}
                        </div>
                      </div>
                      
                      {hasExistingFeedback && !isEditingFeedback && (
                        <div className="mb-6">
                          <h3 className="text-md font-semibold mb-2">Considerations</h3>
                          <ConsiderationsEditor
                            interview={interview}
                            isEditable={false}
                            initialRatings={feedback.considerations}
                            onRatingsChange={(ratings) => {
                              setFeedback(prev => ({
                                ...prev,
                                considerations: ratings
                              }));
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2">Comments</h3>
                        <div className="prose max-w-none bg-white p-4 rounded-md border border-gray-200" 
                          dangerouslySetInnerHTML={{ __html: feedback.comments || '<p>No comments provided</p>' }}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2">Overall Rating</h3>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(star)}
                              className={`${
                                feedback.rating >= star
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              } hover:text-yellow-400 focus:outline-none focus:ring-0`}
                            >
                              <StarIcon className="h-8 w-8" />
                            </button>
                          ))}
                          <span className="ml-2 text-gray-600">
                            {feedback.rating > 0 ? `${feedback.rating} out of 5` : 'No rating'}
                          </span>
                        </div>
                      </div>
                  
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-4">Considerations</h3>
                        <ConsiderationsEditor
                          interview={interview}
                          isEditable={isEditingFeedback}
                          initialRatings={feedback.considerations}
                          onRatingsChange={(ratings) => {
                            setFeedback(prev => ({
                              ...prev,
                              considerations: ratings
                            }));
                          }}
                        />
                      </div>
                    
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2">Comments</h3>
                        <ReactQuill
                          theme="snow"
                          value={feedback.comments}
                          onChange={handleCommentsChange}
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{'list': 'ordered'}, {'list': 'bullet'}],
                              ['link', 'blockquote'],
                              [{ 'indent': '-1'}, { 'indent': '+1' }],
                              ['clean']
                            ],
                          }}
                          formats={[
                            'header',
                            'bold', 'italic', 'underline', 'strike',
                            'list', 'bullet',
                            'link', 'blockquote',
                            'indent'
                          ]}
                          className="bg-white mb-4 quill-editor"
                          placeholder="Provide detailed feedback about the candidate..."
                        />
                      </div>
                    
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2">Final Decision</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <button
                            type="button"
                            onClick={() => handleDecisionChange('definitely_no')}
                            className={`py-2 px-4 rounded-md ${
                              feedback.decision === 'definitely_no'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            Definitely No
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecisionChange('no')}
                            className={`py-2 px-4 rounded-md ${
                              feedback.decision === 'no'
                                ? 'bg-orange-600 text-white'
                                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecisionChange('yes')}
                            className={`py-2 px-4 rounded-md ${
                              feedback.decision === 'yes'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecisionChange('definitely_yes')}
                            className={`py-2 px-4 rounded-md ${
                              feedback.decision === 'definitely_yes'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            Definitely Yes
                          </button>
                        </div>
                      </div>
                    
                      <div className="flex justify-end space-x-3">
                        {hasExistingFeedback && (
                          <button
                            type="button"
                            onClick={handleCancelFeedbackEditing}
                            disabled={isSavingFeedback || isLoadingFeedback}
                            className="border border-gray-300 bg-white text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 flex items-center"
                          >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSubmitFeedback}
                          disabled={isSavingFeedback || isLoadingFeedback}
                          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 flex items-center"
                        >
                          {isSavingFeedback ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Submit Feedback
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Meeting details widget */}
        <div>
          <div className={`${interview.status === 'cancelled' ? 'bg-red-50' : 'bg-white'} shadow rounded-lg overflow-hidden sticky top-6`}>
            <div className={`${interview.status === 'cancelled' ? 'bg-red-600' : 'bg-blue-600'} text-white p-4 flex justify-between items-center`}>
              <h2 className="text-lg font-semibold">Meeting Details</h2>
              {interview.status === 'cancelled' && (
                <span className="px-2 py-1 bg-white text-red-600 text-xs font-bold rounded-md">
                  CANCELLED
                </span>
              )}
            </div>
            <div className="p-4">
              {interview.status === 'cancelled' && interview.cancellationReason && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Cancellation Reason:</h3>
                  <p className="text-sm text-red-700">{interview.cancellationReason}</p>
                </div>
              )}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Date:</span>
                </div>
                <p className="ml-7">{formatDate(interview.scheduledDate)}</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Time:</span>
                </div>
                <p className="ml-7">{formatTime(interview.scheduledDate)}</p>
              </div>
              
              {interview.location && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium">Location:</span>
                  </div>
                  <p className="ml-7">{interview.location}</p>
                </div>
              )}
              
              {interview.onlineMeetingUrl && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <VideoCameraIcon className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium">Online Meeting:</span>
                  </div>
                  <a 
                    href={interview.onlineMeetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-7 text-blue-600 hover:underline flex items-center"
                  >
                    Join Meeting
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                </div>
              )}
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium">Interviewers:</span>
                  </div>
                  {/* Only show Edit button for interviews that haven't passed */}
                  {!isInterviewPassed(interview.scheduledDate) && (
                    <button
                      onClick={() => setShowEditInterviewersModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
                <div className="ml-7">
                  {interview.interviewers && interview.interviewers.length > 0 ? (
                    <ul className="space-y-1">
                      {interview.interviewers.map((interviewer) => (
                        <li key={interviewer.userId} className="flex items-center">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                            {interviewer.name.charAt(0).toUpperCase()}
                          </span>
                          {interviewer.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No interviewers assigned</p>
                  )}
                </div>
              </div>
              
              {interview.description && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium">Description:</span>
                  </div>
                  <p className="ml-7 text-sm">{interview.description}</p>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                  href={`/applicants/${interview.applicantId}`}
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 mb-3"
                >
                  View Full Candidate Profile
                </a>
                
                {interview.status !== 'cancelled' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {/* Check if interview has already passed */}
                    {isInterviewPassed(interview.scheduledDate) ? (
                      <div className="col-span-2 text-center text-gray-500 italic">
                        This interview has already passed and cannot be modified
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            // Check if interview has already passed before showing modal
                            if (isInterviewPassed(interview.scheduledDate)) {
                              toast.error('Cannot reschedule an interview that has already passed');
                              return;
                            }
                            setShowRescheduleModal(true);
                          }}
                          className="bg-amber-100 text-amber-800 hover:bg-amber-200 py-2 px-3 rounded-md flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Reschedule
                        </button>
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="bg-red-100 text-red-800 hover:bg-red-200 py-2 px-3 rounded-md flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Reschedule Interview
                    </h3>
                    <div className="mt-2">
                      <label htmlFor="newScheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                        New Date and Time
                      </label>
                      <input
                        type="datetime-local"
                        id="newScheduledDate"
                        value={newScheduledDate}
                        onChange={(e) => setNewScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleRescheduleInterview}
                  disabled={isRescheduling}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-300"
                >
                  {isRescheduling ? 'Rescheduling...' : 'Reschedule'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  disabled={isRescheduling}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Interviewers Modal */}
      <EditInterviewersModal
        isOpen={showEditInterviewersModal}
        onClose={() => setShowEditInterviewersModal(false)}
        interviewers={interview?.interviewers || []}
        onSave={handleUpdateInterviewers}
        isLoading={isUpdatingInterviewers}
      />
    </div>
  );
};

export default InterviewDetailPage;
