import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import jobApplicationService, { JobApplicant } from '../../services/jobApplicationService';
import jobService from '../../services/jobService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { toast } from 'react-toastify';
import Card from '../common/Card';

const MyReferralsList: React.FC = () => {
  const [referrals, setReferrals] = useState<JobApplicant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      try {
        const data = await jobApplicationService.getUserReferrals();
        setReferrals(data);
        
        // Fetch job titles for all referrals
        const jobIdsSet = new Set<string>();
        data.forEach(referral => jobIdsSet.add(referral.jobId));
        const jobIds = Array.from(jobIdsSet);
        const titles: Record<string, string> = {};
        
        await Promise.all(jobIds.map(async (jobId) => {
          try {
            const job = await jobService.getJob(jobId);
            titles[jobId] = job.title;
          } catch (error) {
            console.error(`Error fetching job ${jobId}:`, error);
            titles[jobId] = 'Unknown Position';
          }
        }));
        
        setJobTitles(titles);
      } catch (error) {
        console.error('Error fetching referrals:', error);
        toast.error('Failed to load your referrals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'debrief':
        return 'bg-orange-100 text-orange-800';
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

  const getStatusProgress = (referral: JobApplicant): { label: string; percentage: number; color: string } => {
    // Use progress from backend
    const percentage = referral.progress ?? 0;
    
    // Map status to label and color
    const statusMap: Record<string, { label: string; color: string }> = {
      'new': { label: 'Application Received', color: 'bg-blue-500' },
      'reviewed': { label: 'Under Review', color: 'bg-blue-500' },
      'contacted': { label: 'Contacted', color: 'bg-blue-500' },
      'debrief': { label: 'In Debrief', color: 'bg-indigo-500' },
      'offered': { label: 'Offer Extended', color: 'bg-orange-500' },
      'hired': { label: 'Hired', color: 'bg-green-500' },
      'rejected': { label: 'Rejected', color: 'bg-red-500' },
    };
    
    const statusInfo = statusMap[referral.status] || { label: 'Unknown', color: 'bg-gray-500' };
    
    return {
      percentage,
      label: statusInfo.label,
      color: statusInfo.color
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <Card className="text-center">
        <div className="mb-4">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No referrals yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          You haven't referred any candidates yet. Use the "Refer a Candidate" tab to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((referral) => (
        <Card key={referral.id} className="hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm font-medium text-blue-600 truncate">
                {referral.firstName} {referral.lastName}
              </p>
              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(referral.status)}`}>
                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{getStatusProgress(referral).label}</span>
              <span>{getStatusProgress(referral).percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getStatusProgress(referral).color}`}
                style={{ width: `${getStatusProgress(referral).percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-3 sm:flex">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                <BriefcaseIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {jobTitles[referral.jobId] || 'Loading...'}
              </p>
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {formatDate(referral.createdAt)}
              </p>
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                Referred {formatTime(referral.createdAt)}
              </p>
            </div>
          </div>          
        </Card>
      ))}
    </div>
  );
};

export default MyReferralsList;
