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

const JobApplicantsList: React.FC<JobApplicantsListProps> = ({ jobId }) => {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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


  const getStatusBadgeClass = (applicant: JobApplicant) => {
    const stage = applicant.stages.find(stage => stage.id === applicant.status);
    return stage?.color.replace('500', '100') + ' text-' + stage?.color.replace('500', '800');
  };
  
  const mapStatusToDisplayStage = (applicant: JobApplicant): string => {
    const matchingStage = applicant.stages.find(stage => 
      stage.id === applicant.status || 
      stage.title.toLowerCase() === applicant.status.toLowerCase()
    );
    
    if (matchingStage) {
      return matchingStage.title;
    }
    
    return applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1);
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
                <span className={`inline-flex text-xs font-semibold rounded-full px-2.5 py-0.5 ${getStatusBadgeClass(applicant)}`}>
                  {mapStatusToDisplayStage(applicant)}
                </span>
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