import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BriefcaseIcon,
  ArrowRightIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Card from '../common/Card';

interface JobApproval {
  id: string;
  title: string;
  department: string;
  requestedBy: string;
  requestedByName: string;
  status: string;
  createdAt: string;
}

interface JobApprovalsWidgetProps {
  jobs: JobApproval[];
}

const JobApprovalsWidget: React.FC<JobApprovalsWidgetProps> = ({ jobs }) => {

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Don't render if no jobs
  if (jobs.length === 0) {
    return null;
  }

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'draft': 'bg-gray-100 text-gray-800 border-gray-300',
      'approved': 'bg-green-100 text-green-800 border-green-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusBorderColor = (status: string): string => {
    const borderColors: Record<string, string> = {
      'pending': 'border-l-yellow-500',
      'draft': 'border-l-gray-500',
      'approved': 'border-l-green-500',
      'rejected': 'border-l-red-500',
    };
    return borderColors[status.toLowerCase()] || 'border-l-gray-500';
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-6 w-6 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-800">Jobs Pending Approval</h2>
        </div>
        <Link
          to="/jobs"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          See all
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className={`block p-4 border-l-4 ${getStatusBorderColor(job.status)} border border-gray-200 rounded-lg hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">
                    {job.requestedByName}
                  </span>
                </div>
              </div>
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(job.status)}`}>
                {job.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                <span>{job.department}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default JobApprovalsWidget;
