import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import interviewProcessService, { InterviewProcess } from '../services/interviewProcessService';
import interviewService, { Interview } from '../services/interviewService';
import { toast } from 'react-toastify';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/solid';

const InterviewsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get tab from URL query parameters
  const getTabFromUrl = useCallback((): 'processes' | 'active' => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'processes' ? 'processes' : 'active';
  }, [location.search]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'processes' | 'active'>(getTabFromUrl());
  
  // Interview processes state
  const [interviewProcesses, setInterviewProcesses] = useState<InterviewProcess[]>([]);
  const [isLoadingProcesses, setIsLoadingProcesses] = useState<boolean>(true);
  const [processesError, setProcessesError] = useState<string | null>(null);
  
  // Active interviews state
  const [activeInterviews, setActiveInterviews] = useState<Interview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState<boolean>(true);
  const [interviewsError, setInterviewsError] = useState<string | null>(null);

  // Listen for URL changes
  useEffect(() => {
    const tab = getTabFromUrl();
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search, activeTab, getTabFromUrl]);

  // Fetch interview processes
  useEffect(() => {
    const fetchInterviewProcesses = async () => {
      setIsLoadingProcesses(true);
      setProcessesError(null);
      
      try {
        const data = await interviewProcessService.getAllProcesses();
        setInterviewProcesses(data);
      } catch (err) {
        console.error('Error fetching interview processes:', err);
        setProcessesError('Failed to load interview processes. Please try again.');
      } finally {
        setIsLoadingProcesses(false);
      }
    };
    
    if (activeTab === 'processes') {
      fetchInterviewProcesses();
    }
  }, [activeTab]);
  
  // Fetch active interviews
  useEffect(() => {
    const fetchActiveInterviews = async () => {
      setIsLoadingInterviews(true);
      setInterviewsError(null);
      
      try {
        const data = await interviewService.getActiveInterviews();
        setActiveInterviews(data);
      } catch (err) {
        console.error('Error fetching active interviews:', err);
        setInterviewsError('Failed to load active interviews. Please try again.');
      } finally {
        setIsLoadingInterviews(false);
      }
    };
    
    if (activeTab === 'active') {
      fetchActiveInterviews();
    }
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this interview process?')) {
      try {
        await interviewProcessService.deleteProcess(id);
        setInterviewProcesses(prevProcesses => 
          prevProcesses.filter(process => process.id !== id)
        );
        toast.success('Interview process deleted successfully');
      } catch (err) {
        console.error('Error deleting interview process:', err);
        toast.error('Failed to delete interview process');
      }
    }
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
  
  // Loading state
  const isLoading = (activeTab === 'processes' && isLoadingProcesses) || 
                   (activeTab === 'active' && isLoadingInterviews);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {activeTab === 'processes' ? 'Interview Processes' : 'Active Interviews'}
        </h1>
        <div>
          {activeTab === 'processes' && (
            <Link
              to="/interviews/create"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Process
            </Link>
          )}
          {activeTab === 'active' && (
            <Link
              to="/interviews"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              View All Interviews
            </Link>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            to="/interviews?tab=active"
            className={`${activeTab === 'active' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('active');
              navigate('/interviews?tab=active', { replace: true });
            }}
          >
            Active Applicant Interviews
          </Link>
          <Link
            to="/interviews?tab=processes"
            className={`${activeTab === 'processes' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('processes');
              navigate('/interviews?tab=processes', { replace: true });
            }}
          >
            Interview Processes
          </Link>
        </nav>
      </div>

      {/* Error messages */}
      {activeTab === 'processes' && processesError && (
        <div className="bg-red-100 p-4 rounded text-red-700 mb-6">
          {processesError}
        </div>
      )}
      
      {activeTab === 'active' && interviewsError && (
        <div className="bg-red-100 p-4 rounded text-red-700 mb-6">
          {interviewsError}
        </div>
      )}

      {/* Interview Processes Tab Content */}
      {activeTab === 'processes' && (
        <>
          {interviewProcesses.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">No interview processes found. Create your first interview process to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviewProcesses.map((process) => (
                <div key={process.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="border-l-4 border-blue-500 p-6">
                    <h2 className="text-xl font-semibold mb-3 text-blue-800">{process.jobRole.title}</h2>
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2">
                        {process.stages.length} {process.stages.length === 1 ? 'Stage' : 'Stages'}
                      </div>
                      {process.createdBy && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {process.createdBy.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Created {new Date(process.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <Link
                        to={`/interviews/${process.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View
                      </Link>
                      <div className="flex space-x-2">
                        <Link
                          to={`/interviews/${process.id}/edit`}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(process.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Active Interviews Tab Content */}
      {activeTab === 'active' && (
        <>
          {activeInterviews.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">No active interviews found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInterviews.map((interview) => (
                <div key={interview.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="border-l-4 border-blue-500 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold mb-2 text-blue-800">{interview.title}</h2>
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2">
                            {interview.status}
                          </div>
                          <div className="text-sm text-gray-500">
                            {interview.jobTitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/interview/${interview.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View Interview
                        </Link>
                        <Link
                          to={`/applicants/${interview.applicantId}`}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          View Applicant
                        </Link>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium">Applicant:</span>
                        <span className="ml-2">{interview.applicantName}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium">Date:</span>
                        <span className="ml-2">{formatDate(interview.scheduledDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium">Time:</span>
                        <span className="ml-2">{formatTime(interview.scheduledDate)}</span>
                      </div>
                    </div>
                    
                    {interview.description && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p className="font-medium">Description:</p>
                        <p className="mt-1">{interview.description}</p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600">Interviewers:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {interview.interviewers.map((interviewer) => (
                          <span 
                            key={interviewer.userId} 
                            className="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full"
                          >
                            <UserIcon className="h-3 w-3 mr-1" />
                            {interviewer.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewsPage;
