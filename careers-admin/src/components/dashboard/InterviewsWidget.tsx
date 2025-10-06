import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon,
  ArrowRightIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Card from '../common/Card';

interface Interview {
  id: string;
  scheduledDate: string;
  title: string;
  description?: string;
  interviewers: Array<{
    userId: string;
    name: string;
  }>;
  stage: string;
  status: string;
  applicantId: string;
  applicantName: string;
  jobTitle: string;
  createdAt: string;
}

interface InterviewsWidgetProps {
  interviews: Interview[];
}

const InterviewsWidget: React.FC<InterviewsWidgetProps> = ({ interviews }) => {

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Don't render if no interviews
  if (interviews.length === 0) {
    return null;
  }

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-300',
      'pending': 'bg-amber-100 text-amber-800 border-amber-300',
      'rescheduled': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in_progress': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'completed': 'bg-green-100 text-green-800 border-green-300',
      'cancelled': 'bg-red-100 text-red-800 border-red-300',
      'canceled': 'bg-red-100 text-red-800 border-red-300',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusBorderColor = (status: string): string => {
    const borderColors: Record<string, string> = {
      'scheduled': 'border-l-blue-500',
      'pending': 'border-l-amber-500',
      'rescheduled': 'border-l-yellow-500',
      'in_progress': 'border-l-indigo-500',
      'completed': 'border-l-green-500',
      'cancelled': 'border-l-red-500',
      'canceled': 'border-l-red-500',
    };
    return borderColors[status.toLowerCase()] || 'border-l-gray-500';
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Follow Your Interviews</h2>
        </div>
        <Link
          to="/interviews"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          See all
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {interviews.map((interview) => (
          <Link
            key={interview.id}
            to={`/interview/${interview.id}`}
            className={`block p-4 border-l-4 ${getStatusBorderColor(interview.status)} border border-gray-200 rounded-lg hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {interview.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">
                    {interview.applicantName}
                  </span>
                </div>
              </div>
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(interview.status)}`}>
                {interview.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span>{formatDate(interview.scheduledDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span>{formatTime(interview.scheduledDate)}</span>
              </div>
            </div>

            {interview.interviewers && interview.interviewers.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {interview.interviewers.slice(0, 3).map((interviewer) => (
                    <span
                      key={interviewer.userId}
                      className="inline-flex items-center bg-sky-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      {interviewer.name}
                    </span>
                  ))}
                  {interview.interviewers.length > 3 && (
                    <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      +{interview.interviewers.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default InterviewsWidget;
