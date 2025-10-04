import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import TabNavigation from '../components/common/TabNavigation';
import { 
  ArrowLeftIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import jobApplicationService, { JobApplicant, Note } from '../services/jobApplicationService';
import jobService, { Job } from '../services/jobService';
import interviewProcessService from '../services/interviewProcessService';
import interviewService, { Interview } from '../services/interviewService';
import ApplicantStagesList from '../components/applicants/ApplicantStagesList';
import InterviewScheduleModal from '../components/modals/InterviewScheduleModal';
import DebriefPage from './DebriefPage';
import ResumePage from './ResumePage';
import { formatDate, formatTime } from '../utils/dateUtils';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';

interface InterviewStageOption {
  id: string;
  title: string;
  order: number;
  processId: string;
  emailTemplate?: string;
}

const ApplicantDetailPage: React.FC = () => {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const navigate = useNavigate();
  
  const [applicant, setApplicant] = useState<JobApplicant | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewStages, setInterviewStages] = useState<InterviewStageOption[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [savedNote, setSavedNote] = useState<Note | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(false);
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [processId, setProcessId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'debrief' | 'resume'>(
    tab === 'debrief' ? 'debrief' : (tab === 'resume' ? 'resume' : 'details')
  );
  const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState<boolean>(false);
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);

  // Effect to update the active tab when the URL tab parameter changes
  useEffect(() => {
    if (tab === 'debrief') {
      setActiveTab('debrief');
    } else if (tab === 'resume') {
      setActiveTab('resume');
    } else {
      setActiveTab('details');
    }
  }, [tab]);

  // Function to fetch scheduled interviews for the applicant
  const fetchScheduledInterviews = async () => {
    if (!id) return;
    
    setIsLoadingInterviews(true);
    try {
      const interviews = await interviewService.getInterviewsByApplicationId(id);
      // Sort interviews by date (most recent first)
      interviews.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
      setScheduledInterviews(interviews);
    } catch (err) {
      console.error('Error fetching scheduled interviews:', err);
      // Don't show error to user, just log it
    } finally {
      setIsLoadingInterviews(false);
    }
  };
  
  // Handle opening the interview scheduling modal
  const handleOpenInterviewModal = () => {
    setShowInterviewModal(true);
  };
  
  // Handle interview scheduled - navigate to interview details page
  const handleInterviewScheduled = (interviewId: string) => {
    // Navigate to the interview details page
    navigate(`/interview/${interviewId}`);
    toast.success('Interview scheduled successfully');
  };

  useEffect(() => {
    const fetchApplicant = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const applicantData = await jobApplicationService.getApplication(id);
        setApplicant(applicantData);
        
        // Fetch job details
        const jobData = await jobService.getJob(applicantData.jobId);
        setJob(jobData);
        
        // Fetch interview stages
        await fetchInterviewStages(applicantData.jobId);
        
        // Fetch notes for this applicant
        await fetchApplicantNotes(id);

        // Fetch scheduled interviews
        await fetchScheduledInterviews();
      } catch (err) {
        console.error('Error fetching applicant:', err);
        setError('Failed to load applicant data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplicant();
  }, [id]);

  const fetchInterviewStages = async (jobId: string) => {
    setIsLoadingStages(true);
    try {
      // First get the job to find its role ID
      const job = await jobService.getJob(jobId);
      
      // Find the interview process for this job role
      if (job && job.title) {
        // Get all interview processes
        const processes = await interviewProcessService.getAllProcesses();
        
        // Find processes that match the job role title
        const matchingProcesses = processes.filter(process => 
          process.jobRole.title.toLowerCase() === job.title.toLowerCase()
        );
        
        if (matchingProcesses.length > 0) {
          // Use the first matching process
          const process = matchingProcesses[0];
          
          // Store the process ID for use with interviews
          setProcessId(process.id);
          
          // Create standard initial statuses
          const standardInitialStatuses: InterviewStageOption[] = [
            { id: 'new', title: 'New', order: -2, processId: process.id },
            { id: 'reviewed', title: 'Reviewed', order: -1, processId: process.id }
          ];
          
          // Create stage options from the process stages
          const processStages: InterviewStageOption[] = process.stages.map((stage, index) => ({
            id: `stage-${index}`,
            title: stage.title,
            order: stage.order || index,
            processId: process.id,
            emailTemplate: stage.emailTemplate
          }));
          
          // Create standard final statuses
          const standardFinalStatuses: InterviewStageOption[] = [
            { id: 'debrief', title: 'Debrief', order: 996, processId: process.id },
            { id: 'offered', title: 'Offered', order: 997, processId: process.id },
            { id: 'hired', title: 'Hired', order: 998, processId: process.id },
            { id: 'rejected', title: 'Rejected', order: 999, processId: process.id }
          ];
          
          // Combine all statuses
          const allStages = [...standardInitialStatuses, ...processStages, ...standardFinalStatuses];
          
          // Sort by order
          allStages.sort((a, b) => a.order - b.order);
          
          setInterviewStages(allStages);
        } else {
          // No matching process found, use default statuses
          setInterviewStages([
            { id: 'new', title: 'New', order: 0, processId: '' },
            { id: 'reviewed', title: 'Reviewed', order: 1, processId: '' },
            { id: 'contacted', title: 'Contacted', order: 2, processId: '' },
            { id: 'interviewing', title: 'Interviewing', order: 3, processId: '' },
            { id: 'debrief', title: 'Debrief', order: 4, processId: '' },
            { id: 'offered', title: 'Offered', order: 5, processId: '' },
            { id: 'hired', title: 'Hired', order: 6, processId: '' },
            { id: 'rejected', title: 'Rejected', order: 7, processId: '' }
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching interview stages:', err);
      // Use default statuses as fallback
      setInterviewStages([
        { id: 'new', title: 'New', order: 0, processId: '' },
        { id: 'reviewed', title: 'Reviewed', order: 1, processId: '' },
        { id: 'contacted', title: 'Contacted', order: 2, processId: '' },
        { id: 'interviewing', title: 'Interviewing', order: 3, processId: '' },
        { id: 'debrief', title: 'Debrief', order: 4, processId: '' },
        { id: 'offered', title: 'Offered', order: 5, processId: '' },
        { id: 'hired', title: 'Hired', order: 6, processId: '' },
        { id: 'rejected', title: 'Rejected', order: 7, processId: '' }
      ]);
    } finally {
      setIsLoadingStages(false);
    }
  };

  // Calculate progress percentage based on applicant status and real stages
  const getStageProgress = (status: string): number => {
    // If no stages are loaded yet, return 0
    if (!interviewStages || interviewStages.length === 0) {
      return 0;
    }

    // Find the current stage in the interview stages array
    const currentStage = interviewStages.find(stage => stage.id === status || stage.id === `stage-${status}`);
    if (!currentStage) {
      return 0; // Stage not found
    }

    // Get all stages sorted by order
    const sortedStages = [...interviewStages].sort((a, b) => a.order - b.order);
    
    // Find the index of the current stage
    const currentIndex = sortedStages.findIndex(stage => stage.id === currentStage.id);
    if (currentIndex === -1) {
      return 0; // Stage not found in sorted array (shouldn't happen)
    }

    // Calculate progress percentage based on position in the stages array
    return Math.round((currentIndex / (sortedStages.length - 1)) * 100);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      // The mapping will be handled in the service layer
      const updatedApplicant = await jobApplicationService.updateApplicationStatus(id, newStatus);
      
      // Update the applicant in the local state
      setApplicant(updatedApplicant);
    } catch (err) {
      console.error('Error updating applicant status:', err);
      setError('Failed to update applicant status. Please try again.');
    }
  };

  // Function to fetch notes for the applicant
  const fetchApplicantNotes = async (applicantId: string) => {
    setIsLoadingNotes(true);
    try {
      const notes = await jobApplicationService.getNotes(applicantId);
      if (notes && notes.length > 0) {
        // Use the most recent note
        const latestNote = notes[0];
        setSavedNote(latestNote);
        setNotes(latestNote.content);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      // Don't show an error to the user, just log it
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id || !notes.trim()) return;
    
    setIsSavingNote(true);
    try {
      if (savedNote) {
        // Find the index of the note to update
        // In a real implementation, we would store the index or use the note ID
        // For now, we'll assume it's the first note (index 0)
        const noteIndex = 0;
        
        // Update existing note
        const updatedNote = await jobApplicationService.updateNote(id, noteIndex, notes);
        setSavedNote(updatedNote);
        toast.success('Notes updated successfully');
      } else {
        // Create new note
        const newNote = await jobApplicationService.addNote(id, notes);
        setSavedNote(newNote);
        toast.success('Notes saved successfully');
      }
    } catch (err) {
      console.error('Error saving notes:', err);
      toast.error('Failed to save notes. Please try again.');
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-3">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="py-3">
        <div className="bg-red-100 p-4 rounded text-red-700">
          {error || 'Applicant not found'}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {applicant.firstName} {applicant.lastName}
          </h1>
        </div>
        <div className="flex space-x-2">
          <a
            href={`mailto:${applicant.email}`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            Email Candidate
          </a>
          
          {applicant.phone && (
            <a
              href={`tel:${applicant.phone}`}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Call
            </a>
          )}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <TabNavigation
          tabs={[
            {
              id: 'details',
              label: 'Applicant Details',
              icon: <UserCircleIcon className="w-5 h-5" />
            },
            {
              id: 'resume',
              label: 'Resume',
              icon: <DocumentTextIcon className="w-5 h-5" />
            },
            {
              id: 'debrief',
              label: 'Interviews Debrief',
              icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />
            }
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId as 'details' | 'debrief' | 'resume');
            if (tabId === 'details') {
              navigate(`/applicants/${id}`);
            } else {
              navigate(`/applicants/${id}/${tabId}`);
            }
          }}
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Applicant details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Applicant Details
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
                
                {applicant.isReferral && (
                  <div className="mb-6 bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <UserPlusIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-700">Referral</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
                      <div>
                        <span className="text-sm text-gray-500">Referred by:</span>
                        <p className="font-medium">{applicant.refereeName || 'Unknown'}</p>
                      </div>
                      {applicant.refereeEmail && (
                        <div>
                          <span className="text-sm text-gray-500">Referee Email:</span>
                          <p className="font-medium">{applicant.refereeEmail}</p>
                        </div>
                      )}
                    </div>
                    {applicant.refereeRelationship && (
                      <div>
                        <span className="text-sm text-gray-500 block mb-1">Relationship & Fit:</span>
                        <div className="bg-white p-3 rounded border border-green-200">
                          <p className="text-sm">{applicant.refereeRelationship}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Applied For:</span>
                    <p className="font-medium">{job?.title || 'Loading job details...'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Application Date:</span>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="font-medium">{formatDate(applicant.createdAt)}</span>
                      <ClockIcon className="h-4 w-4 ml-2 mr-1 text-gray-500" />
                      <span className="font-medium">{formatTime(applicant.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Application Status:</span>
                    <div>
                      <span className="text-sm text-gray-500">Last Updated:</span>
                      <p className="font-medium">{formatDate(applicant.updatedAt)}</p>
                    </div>
                  </div>
                  
                  {isLoadingStages ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <ApplicantStagesList 
                        stages={interviewStages}
                        currentStage={applicant.status}
                        onStageChange={handleStatusChange}
                        applicantName={`${applicant.firstName} ${applicant.lastName}`}
                        jobTitle={job?.title || 'the position'}
                        applicationId={id || ''}
                        candidateEmail={applicant.email}
                        processId={processId}
                      />
                    </div>
                  )}
                </div>
            </Card>
          </div>

          {/* Right column - Notes and actions */}
          <div>
            {/* Scheduled Interviews */}
            {scheduledInterviews.length > 0 && (
              <Card className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Scheduled Interviews
                    </h2>
                  </div>
                  
                  {isLoadingInterviews ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : scheduledInterviews.length === 0 ? (
                    <div className="text-gray-500 text-sm">No interviews scheduled yet</div>
                  ) : (
                    <div className="space-y-3">
                      {scheduledInterviews.map((interview) => (
                        <div key={interview.id} className={`${interview.status === 'cancelled' ? 'bg-red-50 border-red-100' : 'bg-white border-blue-100'} border rounded-md p-3`}>
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
                        </div>
                      ))}
                    </div>
                  )}
              </Card>
            )}
            
            {/* Application stats */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Application Stats
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Days in Process</div>
                      <div className="text-xl font-semibold text-blue-700">
                        {applicant?.createdAt ? Math.ceil((new Date().getTime() - new Date(applicant.createdAt).getTime()) / (1000 * 3600 * 24)) : 0}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-2">Application Progress</div>
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                              {applicant?.status || 'New'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-green-600">
                              {getStageProgress(applicant?.status || 'new')}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-green-200 mt-1">
                          <div 
                            style={{ width: `${getStageProgress(applicant?.status || 'new')}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-purple-500" />
                      <span className="font-medium">{applicant?.updatedAt ? formatDate(applicant.updatedAt) : 'N/A'}</span>
                      <ClockIcon className="h-4 w-4 ml-2 mr-1 text-purple-500" />
                      <span className="font-medium">{applicant?.updatedAt ? formatTime(applicant.updatedAt) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
            </Card>
            
            {/* Notes */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Notes
                </h2>
                
                {isLoadingNotes ? (
                  <div className="flex justify-center items-center h-64 border border-gray-300 rounded-md mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 h-64 mb-4"
                    placeholder="Add private notes about this candidate..."
                    disabled={isSavingNote}
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    <span className="italic">These notes are only visible to you</span>
                  </p>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNote || isLoadingNotes}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    {isSavingNote ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </button>
                </div>
            </Card>
          </div>
        </div>
      )}
      {activeTab === 'debrief' && (
        <DebriefPage id={id} />
      )}
      {activeTab === 'resume' && (
        <ResumePage id={id || ''} />
      )}
      
      {/* Interview Schedule Modal */}
      {applicant && (
        <InterviewScheduleModal
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          applicationId={id || ''}
          candidateName={`${applicant.firstName} ${applicant.lastName}`}
          candidateEmail={applicant.email}
          onScheduled={handleInterviewScheduled}
          processId={processId}
        />
      )}
    </div>
  );
};

export default ApplicantDetailPage;
