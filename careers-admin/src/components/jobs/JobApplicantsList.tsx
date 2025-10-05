import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import jobApplicationService, { JobApplicant } from '../../services/jobApplicationService';
import interviewProcessService from '../../services/interviewProcessService';
import jobService from '../../services/jobService';
import ScrollableTable from '../common/ScrollableTable';
import { formatDate, formatTime } from '../../utils/dateUtils';
import ActionsMenu from '../common/ActionsMenu';

interface JobApplicantsListProps {
  jobId: string;
}

interface InterviewStageOption {
  id: string;
  title: string;
  order: number;
  processId: string;
}

const JobApplicantsList: React.FC<JobApplicantsListProps> = ({ jobId }) => {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewStages, setInterviewStages] = useState<InterviewStageOption[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await jobApplicationService.getApplicationsByJobId(jobId);
        
        // Add default status to applicants since the server doesn't provide this field
        const applicantsWithStatus = data.map(applicant => ({
          ...applicant,
          // If the applicant already has a status, use it; otherwise, default to 'new'
          status: applicant.status || 'new'
        }));
        
        setApplicants(applicantsWithStatus);
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError('Failed to load applicants. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplicants();
  }, [jobId]);
  
  useEffect(() => {
    const fetchInterviewStages = async () => {
      setIsLoadingStages(true);
      try {
        // First get the job to find its role ID
        const job = await jobService.getJob(jobId);
        
        // Find the interview process for this job role
        if (job && job.title) { // Use job.title instead of roleTitle
          // Get all interview processes
          const processes = await interviewProcessService.getAllProcesses();
          
          // Find processes that match the job role title
          const matchingProcesses = processes.filter(process => 
            process.jobRole.title.toLowerCase() === job.title.toLowerCase()
          );
          
          if (matchingProcesses.length > 0) {
            // Use the first matching process
            const process = matchingProcesses[0];
            
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
              processId: process.id
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
            console.log(allStages);
          } else {
            // No matching process found, use default statuses
            // Include standard initial statuses
            const defaultInitialStatuses: InterviewStageOption[] = [
              { id: 'new', title: 'New', order: 0, processId: '' },
              { id: 'reviewed', title: 'Reviewed', order: 1, processId: '' }
            ];
            
            // Include default interview stages
            const defaultStages: InterviewStageOption[] = [
              { id: 'contacted', title: 'Contacted', order: 2, processId: '' },
            ];
            
            // Include standard final statuses
            const defaultFinalStatuses: InterviewStageOption[] = [
              { id: 'offered', title: 'Offered', order: 3, processId: '' },
              { id: 'hired', title: 'Hired', order: 4, processId: '' },
              { id: 'rejected', title: 'Rejected', order: 5, processId: '' }
            ];
            
            setInterviewStages([...defaultInitialStatuses, ...defaultStages, ...defaultFinalStatuses]);
          }
        } else {
          // No job role found, use default statuses
          // Include standard initial statuses
          const defaultInitialStatuses: InterviewStageOption[] = [
            { id: 'new', title: 'New', order: 0, processId: '' },
            { id: 'reviewed', title: 'Reviewed', order: 1, processId: '' }
          ];
          
          // Include default interview stages
          const defaultStages: InterviewStageOption[] = [
            { id: 'contacted', title: 'Contacted', order: 2, processId: '' },
          ];
          
          // Include standard final statuses
          const defaultFinalStatuses: InterviewStageOption[] = [
            { id: 'offered', title: 'Offered', order: 3, processId: '' },
            { id: 'hired', title: 'Hired', order: 4, processId: '' },
            { id: 'rejected', title: 'Rejected', order: 5, processId: '' }
          ];
          
          setInterviewStages([...defaultInitialStatuses, ...defaultStages, ...defaultFinalStatuses]);
        }
      } catch (err) {
        console.error('Error fetching interview stages:', err);
        // Use default statuses as fallback
        // Include standard initial statuses
        const defaultInitialStatuses: InterviewStageOption[] = [
          { id: 'new', title: 'New', order: 0, processId: '' },
          { id: 'reviewed', title: 'Reviewed', order: 1, processId: '' }
        ];
        
        // Include default interview stages
        const defaultStages: InterviewStageOption[] = [
          { id: 'contacted', title: 'Contacted', order: 2, processId: '' },
        ];
        
        // Include standard final statuses
        const defaultFinalStatuses: InterviewStageOption[] = [
          { id: 'offered', title: 'Offered', order: 3, processId: '' },
          { id: 'hired', title: 'Hired', order: 4, processId: '' },
          { id: 'rejected', title: 'Rejected', order: 5, processId: '' }
        ];
        
        setInterviewStages([...defaultInitialStatuses, ...defaultStages, ...defaultFinalStatuses]);
      } finally {
        setIsLoadingStages(false);
      }
    };
    
    fetchInterviewStages();
  }, [jobId]);


  const getStatusBadgeClass = (status: string) => {
    // Check if the status is one of the interview stages
    const stageIndex = interviewStages.findIndex(stage => stage.id === status);
    
    if (stageIndex === -1) {
      // If not found in stages, use the old status mapping
      switch (status) {
        case 'new':
          return 'bg-blue-100 text-blue-800';
        case 'reviewed':
          return 'bg-purple-100 text-purple-800';
        case 'contacted':
          return 'bg-yellow-100 text-yellow-800';
        case 'offered':
          return 'bg-orange-100 text-orange-800';
        case 'hired':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    } else {
      // For interview stages, use a color based on the stage order
      const totalStages = interviewStages.length;
      const stagePosition = stageIndex / (totalStages - 1); // 0 to 1 range
      
      if (status === 'rejected') {
        return 'bg-red-100 text-red-800';
      } else if (stagePosition < 0.33) {
        return 'bg-blue-100 text-blue-800';
      } else if (stagePosition < 0.66) {
        return 'bg-indigo-100 text-indigo-800';
      } else if (stagePosition < 0.9) {
        return 'bg-orange-100 text-orange-800';
      } else {
        return 'bg-green-100 text-green-800';
      }
    }
  };
  
  // Map the applicant status to a display stage
  const mapStatusToDisplayStage = (status: JobApplicant['status']): string => {
    // Find a matching interview stage by ID or title
    const matchingStage = interviewStages.find(stage => 
      stage.id === status || 
      stage.title.toLowerCase() === status.toLowerCase()
    );
    
    if (matchingStage) {
      return matchingStage.title;
    }
    
    // If no matching stage found, return the status with first letter capitalized
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded text-red-700">
        {error}
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No applicants have applied for this job yet.
      </div>
    );
  }

  return (
    <ScrollableTable>
      <thead className="bg-gray-100">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            Applicant
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            Applied
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            Status
          </th>
          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {applicants.map((applicant) => (
          <React.Fragment key={applicant.id}>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center">
                      <Link to={`/applicants/${applicant.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        {applicant.firstName} {applicant.lastName}
                      </Link>
                      {applicant.isReferral && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <UserPlusIcon className="h-3 w-3 mr-1" />
                          Referral
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {applicant.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                  <div className="text-sm text-gray-900">
                    {formatDate(applicant.createdAt)}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                  <div className="text-sm text-gray-500">
                    {formatTime(applicant.createdAt)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {isLoadingStages ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-500">Loading stages...</span>
                  </div>
                ) : (
                  <span className={`inline-flex text-xs font-semibold rounded-full px-2.5 py-0.5 ${getStatusBadgeClass(applicant.status)}`}>
                    {mapStatusToDisplayStage(applicant.status)}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <ActionsMenu
                  buttonAriaLabel="Applicant actions"
                  align="right"
                  menuWidthPx={192}
                  items={[
                    {
                      label: 'View Details',
                      onClick: () => window.location.href = `/applicants/${applicant.id}`,
                      icon: <EyeIcon className="w-4 h-4" />
                    },
                    {
                      label: 'Send Email',
                      onClick: () => window.location.href = `mailto:${applicant.email}`,
                      icon: <EnvelopeIcon className="w-4 h-4" />
                    },
                    ...(applicant.phone ? [{
                      label: 'Call',
                      onClick: () => window.location.href = `tel:${applicant.phone}`,
                      icon: <PhoneIcon className="w-4 h-4" />
                    }] : [])
                  ]}
                />
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </ScrollableTable>
  );
};

export default JobApplicantsList;