import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TabNavigation from '../components/common/TabNavigation';
import Select from '../components/common/Select';
import interviewProcessService, { InterviewProcess } from '../services/interviewProcessService';
import interviewService, { Interview } from '../services/interviewService';
import { toast } from 'react-toastify';
// Icons are now used in the InterviewCard component
import InterviewCard from '../components/interviews/InterviewCard';
import { useAuth } from '../context/AuthContext';

const InterviewsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, userId } = useAuth();
  const isUser = userRole === 'user';
  
  // Get tab from URL query parameters
  const getTabFromUrl = useCallback((): 'processes' | 'active' | 'my-interviews' => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    // If user role is 'user', default to 'my-interviews' tab
    if (isUser) {
      return 'my-interviews';
    }
    
    // For admin and other roles, use the tab from URL or default to 'active'
    return tab === 'processes' ? 'processes' : (tab === 'my-interviews' ? 'my-interviews' : 'active');
  }, [location.search, isUser]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'processes' | 'active' | 'my-interviews'>(getTabFromUrl());
  
  // Interview processes state
  const [interviewProcesses, setInterviewProcesses] = useState<InterviewProcess[]>([]);
  const [isLoadingProcesses, setIsLoadingProcesses] = useState<boolean>(true);
  const [processesError, setProcessesError] = useState<string | null>(null);
  
  // Active interviews state
  const [activeInterviews, setActiveInterviews] = useState<Interview[]>([]);
  const [activeFiltersOpen, setActiveFiltersOpen] = useState<boolean>(false);
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activeFrom, setActiveFrom] = useState<string>('');
  const [activeTo, setActiveTo] = useState<string>('');
  const [isLoadingInterviews, setIsLoadingInterviews] = useState<boolean>(true);
  const [interviewsError, setInterviewsError] = useState<string | null>(null);
  
  // User's interviews state
  const [userInterviews, setUserInterviews] = useState<Interview[]>([]);
  const [isLoadingUserInterviews, setIsLoadingUserInterviews] = useState<boolean>(true);
  const [userInterviewsError, setUserInterviewsError] = useState<string | null>(null);

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
  
  // Fetch user's interviews
  useEffect(() => {
    const fetchUserInterviews = async () => {
      setIsLoadingUserInterviews(true);
      setUserInterviewsError(null);
      
      try {
        const data = await interviewService.getUserInterviews();
        setUserInterviews(data);
      } catch (err) {
        console.error('Error fetching user interviews:', err);
        setUserInterviewsError('Failed to load your interviews. Please try again.');
      } finally {
        setIsLoadingUserInterviews(false);
      }
    };
    
    if (activeTab === 'my-interviews') {
      fetchUserInterviews();
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
                   (activeTab === 'active' && isLoadingInterviews) ||
                   (activeTab === 'my-interviews' && isLoadingUserInterviews);

  // Derived filtered list for Active tab
  const filteredActiveInterviews = React.useMemo(() => {
    if (activeTab !== 'active') return [] as Interview[];
    const q = activeSearch.trim().toLowerCase();
    const fromTs = activeFrom ? new Date(activeFrom).getTime() : null;
    const toTs = activeTo ? new Date(activeTo).getTime() : null;
    return activeInterviews.filter((iv) => {
      // search by title, applicantName, jobTitle
      if (q) {
        const hay = `${iv.title} ${iv.applicantName} ${iv.jobTitle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // status filter
      if (activeStatus !== 'all') {
        if ((iv.status || '').toLowerCase() !== activeStatus.toLowerCase()) return false;
      }
      // date range
      const ts = new Date(iv.scheduledDate).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs) {
        // Include the whole day for 'to'
        const endOfDay = new Date(activeTo);
        endOfDay.setHours(23,59,59,999);
        if (ts > endOfDay.getTime()) return false;
      }
      return true;
    });
  }, [activeTab, activeInterviews, activeSearch, activeStatus, activeFrom, activeTo]);
  
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
        <h1 className="text-xl font-bold text-gray-800">
          {activeTab === 'processes' ? 'Interview Processes' : (activeTab === 'active' ? 'Active Interviews' : 'My Interviews')}
        </h1>
        <div>
          {activeTab === 'processes' && (
            <Link
              to="/interview-processes/create"
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Process
            </Link>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <TabNavigation
        className="mb-6"
        tabs={(() => {
          const tabs = [] as { id: string; label: string; href: string }[];
          if (!isUser) {
            tabs.push({ id: 'active', label: 'All Active Interviews', href: '/interviews?tab=active' });
          }
          tabs.push({ id: 'my-interviews', label: 'My Interviews', href: '/interviews?tab=my-interviews' });
          if (!isUser) {
            tabs.push({ id: 'processes', label: 'Interview Processes', href: '/interviews?tab=processes' });
          }
          return tabs;
        })()}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          const id = tabId as 'processes' | 'active' | 'my-interviews';
          setActiveTab(id);
          navigate(`/interviews?tab=${id}`, { replace: true });
        }}
      />

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
      
      {activeTab === 'my-interviews' && userInterviewsError && (
        <div className="bg-red-100 p-4 rounded text-red-700 mb-6">
          {userInterviewsError}
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
                    <Link to={`/interview-processes/${process.id}`}>
                      <h2 className="text-base font-semibold mb-3 text-blue-800">{process.jobRole.title}</h2>
                    </Link>
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold mr-2">
                        {process.stages.length} {process.stages.length === 1 ? 'Stage' : 'Stages'}
                      </div>
                      {process.createdBy && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {process.createdBy.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Created {new Date(process.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <Link
                        to={`/interview-processes/${process.id}`}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View
                      </Link>
                      <div className="flex space-x-2">
                        <Link
                          to={`/interview-processes/${process.id}/edit`}
                          className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(process.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
            <>
              {/* Filters toggle */}
              <div className="mb-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setActiveFiltersOpen(v => !v)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {activeFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Filters */}
              {activeFiltersOpen && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                      <input
                        type="text"
                        value={activeSearch}
                        onChange={(e) => setActiveSearch(e.target.value)}
                        placeholder="Title, applicant, job title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <Select
                        value={activeStatus === 'all' ? undefined : activeStatus}
                        onChange={(val) => setActiveStatus(val || 'all')}
                        allowEmpty
                        placeholder="All Statuses"
                        className="w-full"
                        options={[
                          { label: 'Scheduled', value: 'scheduled' },
                          { label: 'Pending', value: 'pending' },
                          { label: 'Rescheduled', value: 'rescheduled' },
                          { label: 'In Progress', value: 'in_progress' },
                          { label: 'Completed', value: 'completed' },
                          { label: 'Cancelled', value: 'cancelled' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                      <input
                        type="date"
                        value={activeFrom}
                        onChange={(e) => setActiveFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                      <input
                        type="date"
                        value={activeTo}
                        onChange={(e) => setActiveTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="space-y-4">
                {filteredActiveInterviews.length === 0 ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500">No interviews match your filters.</p>
                  </div>
                ) : (
                  filteredActiveInterviews.map((interview) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      userId={null}
                      variant="active"
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
      
      {/* My Interviews Tab Content */}
      {activeTab === 'my-interviews' && (
        <>
          {userInterviews.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">You don't have any interviews scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userInterviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  variant="my-interview"
                  userId={userId}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewsPage;
