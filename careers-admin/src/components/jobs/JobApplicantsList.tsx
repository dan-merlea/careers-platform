import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import jobApplicationService, { JobApplicant } from '../../services/jobApplicationService';

interface JobApplicantsListProps {
  jobId: string;
}

const JobApplicantsList: React.FC<JobApplicantsListProps> = ({ jobId }) => {
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedApplicant, setExpandedApplicant] = useState<string | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

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

  const handleStatusChange = (applicantId: string, newStatus: JobApplicant['status']) => {
    try {
      // Since the server doesn't support status updates yet, we'll handle it client-side
      // This will log the status change but not actually update it on the server
      jobApplicationService.updateApplicationStatus(applicantId, newStatus);
      
      // Update the applicant in the local state only
      setApplicants(prevApplicants => 
        prevApplicants.map(applicant => 
          applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
        )
      );
    } catch (err) {
      console.error('Error updating applicant status:', err);
      setError('Failed to update applicant status. Please try again.');
    }
  };

  const toggleExpandApplicant = (applicantId: string) => {
    // If we're expanding this applicant
    if (expandedApplicant !== applicantId) {
      setExpandedApplicant(applicantId);
      setSelectedApplicantId(applicantId);
    } else {
      // If we're collapsing, reset everything
      setExpandedApplicant(null);
      setSelectedApplicantId(null);
    }
  };
  
  const handleViewResume = (applicantId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Open resume in a new tab
    const url = jobApplicationService.getResumeDownloadUrl(applicantId);
    window.open(url, '_blank');
  };
  
  // Format date safely to prevent invalid date issues
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString();
    } catch {
      // Silently handle parsing errors and return fallback value
      return 'N/A';
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      // Silently handle parsing errors and return fallback value
      return '';
    }
  };

  const getStatusBadgeClass = (status: JobApplicant['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'interviewing':
        return 'bg-indigo-100 text-indigo-800';
      case 'offered':
        return 'bg-orange-100 text-orange-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Details
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
                        <div className="text-sm font-medium text-gray-900">
                          {applicant.firstName} {applicant.lastName}
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
                    <select
                      value={applicant.status}
                      onChange={(e) => handleStatusChange(applicant.id, e.target.value as JobApplicant['status'])}
                      className={`inline-flex text-xs font-semibold rounded-full px-2.5 py-0.5 ${getStatusBadgeClass(applicant.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {applicant.resumeFilename && (
                        <div className="flex space-x-1">
                          <a 
                            href={jobApplicationService.getResumeDownloadUrl(applicant.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="Download Resume"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                          </a>
                          <button
                            onClick={(e) => handleViewResume(applicant.id, e)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="View Resume"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      <a 
                        href={`mailto:${applicant.email}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        title="Send Email"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </a>
                      {applicant.phone && (
                        <a 
                          href={`tel:${applicant.phone}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Call"
                        >
                          <PhoneIcon className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleExpandApplicant(applicant.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedApplicant === applicant.id ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedApplicant === applicant.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {applicant.linkedin && (
                            <div className="p-2 rounded-lg border border-gray-200">
                              <span className="text-sm text-gray-500 block font-medium">LinkedIn:</span>
                              <a 
                                href={applicant.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                <LinkIcon className="h-4 w-4 mr-1" />
                                {applicant.linkedin}
                              </a>
                            </div>
                          )}
                          {applicant.website && (
                            <div className="p-2 rounded-lg border border-gray-200">
                              <span className="text-sm text-gray-500 block font-medium">Website:</span>
                              <a 
                                href={applicant.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                <LinkIcon className="h-4 w-4 mr-1" />
                                {applicant.website}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {selectedApplicantId && (
                          <div className="mt-4 border rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                              <h3 className="font-medium">Resume</h3>
                              <button 
                                onClick={(e) => handleViewResume(selectedApplicantId, e)}
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                              >
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                View Resume
                              </button>
                            </div>
                            <div className="p-6 bg-white">
                              <div className="flex flex-col items-center justify-center text-center">
                                <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-2" />
                                <p className="text-gray-600 mb-4">Resume is available for this applicant</p>
                                <button
                                  onClick={(e) => handleViewResume(selectedApplicantId, e)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                                >
                                  <EyeIcon className="h-5 w-5 mr-2" />
                                  View Resume
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobApplicantsList;
