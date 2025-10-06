import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon,
  ArrowRightIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Card from '../common/Card';

interface HeadcountRequest {
  id: string;
  title: string;
  department: string;
  requestedBy: string;
  status: string;
  createdAt: string;
  justification?: string;
}

interface HeadcountRequestsWidgetProps {
  requests: HeadcountRequest[];
}

const HeadcountRequestsWidget: React.FC<HeadcountRequestsWidgetProps> = ({ requests }) => {
  // Don't render if no requests
  if (requests.length === 0) {
    return null;
  }

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'in_review': 'bg-blue-100 text-blue-800',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-6 w-6 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-800">Headcount Requests</h2>
        </div>
        <Link
          to="/headcount-requests"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          See all
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <Link
            key={request.id}
            to={`/headcount-requests/${request.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {request.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <DocumentTextIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">
                    {request.department}
                  </span>
                </div>
              </div>
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(request.status)}`}>
                {request.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>{formatDate(request.createdAt)}</span>
              </div>
              <div className="truncate">
                Requested by: {request.requestedBy}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default HeadcountRequestsWidget;
