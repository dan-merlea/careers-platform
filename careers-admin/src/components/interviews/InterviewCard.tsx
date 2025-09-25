import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/solid';
import { Interview } from '../../services/interviewService';

interface InterviewCardProps {
  interview: Interview;
  variant: 'active' | 'my-interview';
  userId: string | null;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  variant,
  userId,
  formatDate,
  formatTime
}) => {
  const isActive = variant === 'active';
  const accentColor = isActive ? 'blue' : 'purple';
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`border-l-4 border-${accentColor}-500 p-4`}>
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/interview/${interview.id}`}>
              <h2 className={`text-l font-semibold mb-2 text-${accentColor}-800`}>{interview.title}</h2>
            </Link>
            <div className="flex items-center mb-2">
              <div className={`bg-${accentColor}-100 text-${accentColor}-800 rounded-full px-2 py-0.5 text-xs font-semibold mr-2`}>
                {interview.status.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500">
                {interview.jobTitle}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/interview/${interview.id}`}
              className={`px-2 py-1 bg-${accentColor}-600 text-white text-sm rounded-md hover:bg-${accentColor}-700 transition-colors flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              View
            </Link>
            {isActive && (
              <Link
                to={`/applicants/${interview.applicantId}`}
                className="px-2 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Applicant
              </Link>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center text-xs text-gray-600 mb-1">
            <UserIcon className="h-3 w-3 mr-1" />
            <span className="font-medium">Applicant:</span>
            <span className="ml-1">{interview.applicantName}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-600 mb-1">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span className="font-medium">Date:</span>
            <span className="ml-1">{formatDate(interview.scheduledDate)}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-600 mb-1">
            <ClockIcon className="h-3 w-3 mr-1" />
            <span className="font-medium">Time:</span>
            <span className="ml-1">{formatTime(interview.scheduledDate)}</span>
          </div>
        </div>
        
        {interview.description && (
          <div className="mt-2 text-xs text-gray-600">
            <p className="font-medium">Description:</p>
            <p className="mt-0.5">{interview.description}</p>
          </div>
        )}
        
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600">
            {isActive ? 'Interviewers:' : 'Other Interviewers:'}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {interview.interviewers
              .filter(interviewer => !userId || interviewer.userId !== userId)
              .map((interviewer) => (
                <span 
                  key={interviewer.userId} 
                  className="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                >
                  <UserIcon className="h-2 w-2 mr-1" />
                  {interviewer.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
