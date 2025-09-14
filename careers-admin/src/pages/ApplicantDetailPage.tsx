import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LinkIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import jobApplicationService, { JobApplicant, Note } from '../services/jobApplicationService';
import jobService, { Job } from '../services/jobService';
import interviewProcessService from '../services/interviewProcessService';
import ApplicantStagesList from '../components/applicants/ApplicantStagesList';
import { formatDate, formatTime } from '../utils/dateUtils';
import { toast } from 'react-toastify';

interface InterviewStageOption {
  id: string;
  title: string;
  order: number;
  processId: string;
  emailTemplate?: string;
}

const ApplicantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [applicant, setApplicant] = useState<JobApplicant | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeMimeType, setResumeMimeType] = useState<string>('');
  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false);
  const [interviewStages, setInterviewStages] = useState<InterviewStageOption[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [savedNote, setSavedNote] = useState<Note | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(false);
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [processId, setProcessId] = useState<string>('');

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
        
        // Load resume if available
        if (applicantData.resumeFilename) {
          await loadResumeContent(id);
        }
        
        // Fetch interview stages
        await fetchInterviewStages(applicantData.jobId);
        
        // Fetch notes for this applicant
        await fetchApplicantNotes(id);
      } catch (err) {
        console.error('Error fetching applicant:', err);
        setError('Failed to load applicant data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplicant();
  }, [id]);

  const loadResumeContent = async (applicantId: string) => {
    try {
      setIsLoadingResume(true);
      const { url, mimeType } = await jobApplicationService.getResumeContentUrl(applicantId);
      setResumeUrl(url);
      setResumeMimeType(mimeType);
    } catch (err) {
      console.error('Error loading resume content:', err);
      setError('Failed to load resume content. Please try again.');
    } finally {
      setIsLoadingResume(false);
    }
  };

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
            { id: 'offered', title: 'Offered', order: 4, processId: '' },
            { id: 'hired', title: 'Hired', order: 5, processId: '' },
            { id: 'rejected', title: 'Rejected', order: 6, processId: '' }
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
        { id: 'offered', title: 'Offered', order: 4, processId: '' },
        { id: 'hired', title: 'Hired', order: 5, processId: '' },
        { id: 'rejected', title: 'Rejected', order: 6, processId: '' }
      ]);
    } finally {
      setIsLoadingStages(false);
    }
  };

  // Use the mapping function from jobApplicationService

  const handleStatusChange = async (newStatus: string) => {
    console.log('newStatus', newStatus);
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

  const handleDownloadResume = async () => {
    if (!id) return;
    
    try {
      await jobApplicationService.downloadResume(id);
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError('Failed to download resume. Please try again.');
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

  // Date formatting is now handled by the dateUtils utility

  // Status handling is now done in the ApplicantStagesList component

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="p-6">
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
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

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Applicant details */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded overflow-hidden mb-6">
            <div className="p-6">
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
            </div>
          </div>

          {/* Resume section */}
          <div className="bg-white shadow rounded overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Resume
                </h2>
                <button 
                  onClick={handleDownloadResume}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Download Resume
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg">
                {isLoadingResume ? (
                  <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : resumeUrl ? (
                  <div className="h-96 overflow-hidden">
                    {resumeMimeType.includes('pdf') ? (
                      <iframe 
                        src={resumeUrl} 
                        className="w-full h-full" 
                        title="Resume Preview"
                      />
                    ) : resumeMimeType.includes('image') ? (
                      <img 
                        src={resumeUrl} 
                        alt="Resume" 
                        className="max-w-full max-h-full mx-auto"
                      />
                    ) : (
                      <div className="p-6 flex flex-col items-center justify-center text-center">
                        <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-gray-600 mb-4">Resume is available but cannot be previewed in browser</p>
                        <button
                          onClick={handleDownloadResume}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-2" />
                          Download Resume
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-600">No resume available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Notes and actions */}
        <div>
          <div className="bg-white shadow rounded overflow-hidden mb-6">
            <div className="p-6">
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
                      Save Notes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusChange('contacted')}
                  className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-md hover:bg-yellow-200 flex items-center justify-center"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Mark as Contacted
                </button>
                
                <button
                  onClick={() => handleStatusChange('interviewing')}
                  className="w-full bg-indigo-100 text-indigo-800 py-2 px-4 rounded-md hover:bg-indigo-200 flex items-center justify-center"
                >
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Schedule Interview
                </button>
                
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="w-full bg-red-100 text-red-800 py-2 px-4 rounded-md hover:bg-red-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailPage;
