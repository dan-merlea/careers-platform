import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import Card from '../common/Card';

interface NewCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobId: string;
  jobTitle: string;
  createdAt: string;
}

interface NewCandidatesWidgetProps {
  candidates: NewCandidate[];
}

const NewCandidatesWidget: React.FC<NewCandidatesWidgetProps> = ({ candidates }) => {
  // Don't render if no candidates
  if (candidates.length === 0) {
    return null;
  }

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
          <UserIcon className="h-6 w-6 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">New Candidates to Review</h2>
        </div>
        <Link
          to="/applicants"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          See all
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {candidates.map((candidate) => (
          <Link
            key={candidate.id}
            to={`/applicants/${candidate.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {candidate.firstName} {candidate.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <BriefcaseIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">
                    {candidate.jobTitle}
                  </span>
                </div>
              </div>
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 bg-purple-100 text-purple-800">
                NEW
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Applied {formatDate(candidate.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default NewCandidatesWidget;
