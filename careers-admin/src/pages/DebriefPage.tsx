import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StarIcon } from '@heroicons/react/24/solid';
import { Switch } from '@headlessui/react';
import jobApplicationService from '../services/jobApplicationService';
import Card from '../components/common/Card';
import interviewService, { Interview, InterviewFeedback, Consideration } from '../services/interviewService';
import { userService, User } from '../services/userService';
import { UserRole } from '../services/auth.service';

interface DebriefPageProps {
  id?: string;
}

const DebriefPage: React.FC<DebriefPageProps> = ({ id }) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const applicantId = id || params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [allFeedback, setAllFeedback] = useState<{ [interviewId: string]: InterviewFeedback[] }>({});
  const [considerations, setConsiderations] = useState<{ [stageId: string]: Consideration[] }>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [interviewerVisibility, setInterviewerVisibility] = useState(false);
  const [allInterviewsCompleted, setAllInterviewsCompleted] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Use the real getCurrentUser method
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setError('Failed to fetch user information.');
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch application data, interviews, and feedback
  useEffect(() => {
    if (!applicantId || !currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch application details
        const application = await jobApplicationService.getApplication(applicantId);
        setApplicantName(`${application.firstName} ${application.lastName}`);
        // Use a mock job title since getJobDetails doesn't exist
        setJobTitle('Software Engineer');
        
        // Check if the current user is an interviewer and if they should have access
        const isInterviewer = !['recruiter', 'hiring_manager', 'admin'].includes(currentUser.role);
        
        // If the user is an interviewer but interviewer visibility is not enabled,
        // and the application is not in debrief stage, block access
        if (isInterviewer && 
            !application.interviewerVisibility && 
            application.status !== 'debrief') {
          toast.error('You do not have permission to view this debrief page');
          // Navigate to dashboard would go here if we had access to the navigate function
          setError('Access denied: Interviewer visibility is not enabled for this application');
          setLoading(false);
          return;
        }
        
        // Set the interviewer visibility state based on the application data
        setInterviewerVisibility(application.interviewerVisibility || false);

        // Fetch interviews using the real API
        const interviewsData = await interviewService.getInterviewsByApplicationId(applicantId);
        setInterviews(interviewsData);

        // Fetch feedback for each interview
        const feedbackPromises = interviewsData.map(interview => {
          return interviewService.getFeedbackByInterviewId(interview.id);
        });
        
        const feedbackResults = await Promise.all(feedbackPromises);
        const feedbackMap: { [interviewId: string]: InterviewFeedback[] } = {};
        feedbackResults.forEach((feedback, index) => {
          feedbackMap[interviewsData[index].id] = feedback;
        });
        
        setAllFeedback(feedbackMap);

        // Fetch considerations for each stage
        const considerationPromises = interviewsData.map(interview => {
          const stage = interview.stage;
          return interviewService.getConsiderationsByStage(stage).then(considerations => {
            return { stage, considerations };
          });
        });
        
        const considerationResults = await Promise.all(considerationPromises);
        const considerationsMap: { [stageId: string]: Consideration[] } = {};
        considerationResults.forEach(result => {
          if (result.stage) {
            considerationsMap[result.stage] = result.considerations;
          }
        });
        
        setConsiderations(considerationsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load debrief data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicantId, currentUser, navigate]);

  // Toggle interviewer visibility
  const toggleInterviewerVisibility = async () => {
    try {
      // Update the state locally for immediate feedback
      setInterviewerVisibility(!interviewerVisibility);
      
      // Call the API to update the visibility in the backend
      if (applicantId) {
        await jobApplicationService.updateInterviewerVisibility(applicantId, !interviewerVisibility);
      }
      
      toast.success(`Interviewer visibility ${!interviewerVisibility ? 'enabled' : 'disabled'}`);
    } catch (error) {
      // Revert the state if the API call fails
      setInterviewerVisibility(interviewerVisibility);
      console.error('Error updating interviewer visibility:', error);
      toast.error('Failed to update interviewer visibility.');
    }
  };
  
  // Send reminder to interviewer who hasn't submitted feedback
  const sendReminderToInterviewer = async (interviewId: string, interviewerId: string) => {
    try {
      await interviewService.sendFeedbackReminder(interviewId, interviewerId);
      toast.success('Reminder sent successfully');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  // Check if user is recruiter or hiring manager
  const isRecruiterOrHiringManager = () => {
    if (!currentUser) return false;
    return ['recruiter', 'hiring_manager', 'admin'].includes(currentUser.role);
  };

  // Calculate average rating for an interview
  const calculateAverageRating = (feedbackList: InterviewFeedback[]): number => {
    if (!feedbackList || feedbackList.length === 0) return 0;
    
    const sum = feedbackList.reduce((acc, feedback) => acc + feedback.rating, 0);
    return Math.round((sum / feedbackList.length) * 10) / 10; // Round to 1 decimal place
  };

  // Calculate average consideration rating
  const calculateAverageConsiderationRating = (
    feedbackList: InterviewFeedback[], 
    considerationId: string
  ): number => {
    if (!feedbackList || feedbackList.length === 0) return 0;
    
    let count = 0;
    let sum = 0;
    
    feedbackList.forEach(feedback => {
      if (feedback.considerations && feedback.considerations[considerationId] > 0) {
        sum += feedback.considerations[considerationId];
        count++;
      }
    });
    
    return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  };

  // Get overall decision recommendation
  const getOverallDecision = (): string => {
    let yesCount = 0;
    let noCount = 0;
    let definitelyYesCount = 0;
    let definitelyNoCount = 0;
    let totalCount = 0;

    Object.values(allFeedback).forEach(feedbackList => {
      feedbackList.forEach(feedback => {
        if (feedback.decision) {
          totalCount++;
          if (feedback.decision === 'yes') yesCount++;
          else if (feedback.decision === 'no') noCount++;
          else if (feedback.decision === 'definitely_yes') definitelyYesCount++;
          else if (feedback.decision === 'definitely_no') definitelyNoCount++;
        }
      });
    });

    if (totalCount === 0) return 'No decisions yet';
    
    const yesPercentage = ((yesCount + definitelyYesCount) / totalCount) * 100;
    const noPercentage = ((noCount + definitelyNoCount) / totalCount) * 100;
    
    if (definitelyNoCount > 0) return 'Do Not Proceed';
    if (noPercentage >= 50) return 'Likely No';
    if (yesPercentage >= 80 && definitelyYesCount > 0) return 'Strong Yes';
    if (yesPercentage >= 70) return 'Likely Yes';
    return 'Mixed Feedback';
  };

  // Check if debrief should be visible
  const shouldShowDebrief = () => {
    // Always visible for recruiters and hiring managers
    if (isRecruiterOrHiringManager()) return true;
    
    // For interviewers, only visible if all interviews are completed or visibility is enabled
    return allInterviewsCompleted || interviewerVisibility;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading debrief data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shouldShowDebrief()) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Debrief Not Available</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The debrief will be available once all interviews are completed or when enabled by a recruiter.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (interviews.length === 0) {
    return (
      <div className="bg-white p-8 rounded-md shadow text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No interviews found</h3>
        <p className="mt-1 text-sm text-gray-500">
          There are no interviews scheduled for this applicant yet.
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Interview Debrief: {applicantName}
          </h1>
          <div className="text-sm text-gray-500">{jobTitle}</div>
        </div>
        
        {isRecruiterOrHiringManager() && (
          <div className="mt-4 flex items-center">
            <Switch
              checked={interviewerVisibility}
              onChange={toggleInterviewerVisibility}
              className={`${
                interviewerVisibility ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <span
                className={`${
                  interviewerVisibility ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
              />
            </Switch>
            <span className="ml-2 text-sm text-gray-700">
              {interviewerVisibility ? 'Interviewer visibility enabled' : 'Interviewer visibility disabled'}
            </span>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Overall Decision</h3>
            <div className={`mt-1 text-lg font-semibold ${
              getOverallDecision() === 'Strong Yes' ? 'text-green-600' :
              getOverallDecision() === 'Likely Yes' ? 'text-green-500' :
              getOverallDecision() === 'Mixed Feedback' ? 'text-yellow-500' :
              getOverallDecision() === 'Likely No' ? 'text-red-500' :
              getOverallDecision() === 'Do Not Proceed' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {getOverallDecision()}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <div className="mt-1 flex items-center">
              <div className="text-lg font-semibold mr-2">
                {(() => {
                  let totalRating = 0;
                  let count = 0;
                  
                  Object.values(allFeedback).forEach(feedbackList => {
                    feedbackList.forEach(feedback => {
                      if (feedback.rating > 0) {
                        totalRating += feedback.rating;
                        count++;
                      }
                    });
                  });
                  
                  return count > 0 ? (Math.round((totalRating / count) * 10) / 10).toFixed(1) : 'N/A';
                })()}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  let totalRating = 0;
                  let count = 0;
                  
                  Object.values(allFeedback).forEach(feedbackList => {
                    feedbackList.forEach(feedback => {
                      if (feedback.rating > 0) {
                        totalRating += feedback.rating;
                        count++;
                      }
                    });
                  });
                  
                  const avgRating = count > 0 ? totalRating / count : 0;
                  
                  return (
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 ${
                        avgRating >= star 
                          ? 'text-yellow-400' 
                          : avgRating >= star - 0.5 
                            ? 'text-yellow-300' 
                            : 'text-gray-300'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                ({(() => {
                  let count = 0;
                  
                  Object.values(allFeedback).forEach(feedbackList => {
                    count += feedbackList.filter(f => f.rating > 0).length;
                  });
                  
                  return count;
                })()} ratings)
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Interview Completion</h3>
            <div className="mt-1">
              <div className="text-lg font-semibold">
                {interviews.filter(i => i.status === 'completed').length} of {interviews.length} Complete
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${(interviews.filter(i => i.status === 'completed').length / interviews.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Considerations Summary section was removed */}
      </div>

      {/* Interview Feedback Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Interview Feedback</h2>
        
        {interviews.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
            <p className="text-gray-500">No interviews scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {interviews.map((interview) => {
              const feedbackList = allFeedback[interview.id] || [];
              const stageConsiderations = considerations[interview.stage] || [];
              
              return (
                <div key={interview.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{interview.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(interview.scheduledDate).toLocaleDateString()} • {interview.stage}
                      </p>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                          interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-sm font-medium mr-2">
                          Avg: {calculateAverageRating(feedbackList).toFixed(1)}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`h-4 w-4 ${
                                calculateAverageRating(feedbackList) >= star 
                                  ? 'text-yellow-400' 
                                  : calculateAverageRating(feedbackList) >= star - 0.5 
                                    ? 'text-yellow-300' 
                                    : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {feedbackList.length} of {interview.interviewers.length} feedback submitted
                      </p>
                    </div>
                  </div>
                  
                  {/* Interviewers and their feedback */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Interviewers</h4>
                    <div className="space-y-3">
                      {interview.interviewers.map((interviewer) => {
                        const interviewerFeedback = feedbackList.find(
                          feedback => feedback.interviewerId === interviewer.userId
                        );
                        
                        return (
                          <div key={interviewer.userId} className="border-b border-gray-100 pb-3 mb-3">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-medium">{interviewer.name}</div>
                              {interviewerFeedback ? (
                                <div className="flex items-center">
                                  <span className={`mr-2 text-sm ${
                                    interviewerFeedback.decision === 'definitely_yes' ? 'text-green-600' :
                                    interviewerFeedback.decision === 'yes' ? 'text-green-500' :
                                    interviewerFeedback.decision === 'no' ? 'text-red-500' :
                                    interviewerFeedback.decision === 'definitely_no' ? 'text-red-600' :
                                    'text-gray-500'
                                  }`}>
                                    {interviewerFeedback.decision === 'definitely_yes' && 'Definitely Yes'}
                                    {interviewerFeedback.decision === 'yes' && 'Yes'}
                                    {interviewerFeedback.decision === 'no' && 'No'}
                                    {interviewerFeedback.decision === 'definitely_no' && 'Definitely No'}
                                  </span>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <StarIcon
                                        key={star}
                                        className={`h-4 w-4 ${
                                          interviewerFeedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-2">No feedback yet</span>
                                  <button
                                    type="button"
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => sendReminderToInterviewer(interview.id, interviewer.userId)}
                                  >
                                    Send Reminder
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            
                            
                            {/* Individual consideration ratings */}
                            {interviewerFeedback && interviewerFeedback.considerations && (
                              <div className="mt-2 pl-4 border-l-2 border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Consideration Ratings:</p>
                                <div className="grid grid-cols-1 gap-1">
                                  {(() => {
                                    // Get all consideration keys from the feedback
                                    const considerationKeys = Object.keys(interviewerFeedback.considerations);
                                    
                                    // If we have stage considerations, try to match them
                                    if (stageConsiderations.length > 0) {
                                      return stageConsiderations.map((consideration, index) => {
                                        // Try to find a direct match by ID
                                        let rating = interviewerFeedback.considerations[consideration.id];
                                        
                                        // If no direct match, try to match by index (consideration_0, consideration_1, etc.)
                                        if (rating === undefined && considerationKeys.includes(`consideration_${index}`)) {
                                          rating = interviewerFeedback.considerations[`consideration_${index}`];
                                        }
                                        
                                        if (rating === undefined) return null;
                                        
                                        return (
                                          <div key={consideration.id} className="flex justify-between items-center">
                                            <div className="text-xs">{consideration.title}</div>
                                            <div className="flex items-center">
                                              <span className="text-xs mr-1">{rating}</span>
                                              <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <StarIcon
                                                    key={star}
                                                    className={`h-3 w-3 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      });
                                    } else {
                                      // Use consideration names from the current interview stage
                                      return considerationKeys.map(key => {
                                        const rating = interviewerFeedback.considerations[key];
                                        
                                        // Try to extract index from consideration_X format
                                        let considerationName = key;
                                        const match = key.match(/consideration_(\d+)/);
                                        const index = match ? parseInt(match[1]) : -1;
                                        
                                        // Create a direct mapping between consideration_X and real names
                                        const considerationMapping: Record<string, string> = {
                                          'consideration_0': 'Technical Knowledge',
                                          'consideration_1': 'Problem Solving',
                                          'consideration_2': 'Code Quality',
                                          'consideration_3': 'Communication Skills',
                                          'consideration_4': 'Team Fit',
                                          'consideration_5': 'Values Alignment'
                                        };
                                        
                                        // Use the direct mapping if available
                                        if (Object.prototype.hasOwnProperty.call(considerationMapping, key)) {
                                          considerationName = considerationMapping[key];
                                        }
                                        
                                        // If not in direct mapping, try to use stage considerations
                                        if (considerationName === key && interview.stage && index >= 0) {
                                          const stageConsiderations = considerations[interview.stage] || [];
                                          if (stageConsiderations.length > index) {
                                            considerationName = stageConsiderations[index].title;
                                          }
                                        }
                                        
                                        // If we couldn't find a name, format the key nicely
                                        if (considerationName === key) {
                                          considerationName = key.replace('consideration_', 'Consideration ');
                                        }
                                        
                                        return (
                                          <div key={key} className="flex justify-between items-center">
                                            <div className="text-xs">{considerationName}</div>
                                            <div className="flex items-center">
                                              <span className="text-xs mr-1">{rating}</span>
                                              <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <StarIcon
                                                    key={star}
                                                    className={`h-3 w-3 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      });
                                    }
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Considerations */}
                  {stageConsiderations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Considerations</h4>
                      <div className="space-y-3">
                        {stageConsiderations.map((consideration) => (
                          <div key={consideration.id} className="bg-white p-3 rounded border border-gray-100">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-medium">{consideration.title}</div>
                              <div className="flex items-center">
                                <span className="text-xs mr-1">
                                  {calculateAverageConsiderationRating(feedbackList, consideration.id).toFixed(1)}
                                </span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                      key={star}
                                      className={`h-3 w-3 ${
                                        calculateAverageConsiderationRating(feedbackList, consideration.id) >= star 
                                          ? 'text-yellow-400' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{consideration.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Comments */}
                  {feedbackList.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                      <div className="space-y-3">
                        {feedbackList.map((feedback) => (
                          <div key={feedback.interviewerId} className="bg-white p-3 rounded border border-gray-100">
                            <div className="text-xs font-medium text-gray-700 mb-1">{feedback.interviewerName}</div>
                            <div className="text-sm prose prose-sm max-w-none" 
                                 dangerouslySetInnerHTML={{ __html: feedback.comments || 'No comments provided' }}>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DebriefPage;
