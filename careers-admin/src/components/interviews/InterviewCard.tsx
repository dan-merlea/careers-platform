import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { EllipsisHorizontalIcon, EyeIcon, UserIcon as UserIconOutline } from '@heroicons/react/24/outline';
import ActionsMenu, { ActionsMenuItem } from '../common/ActionsMenu';
import { Interview } from '../../services/interviewService';
import Card from '../common/Card';

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
  // Map statuses to explicit Tailwind classes to avoid JIT issues
  const statusStyles: Record<string, { border: string; chipBg: string; chipText: string; titleText: string }> = {
    scheduled:   { border: 'border-blue-500',  chipBg: 'bg-blue-100',  chipText: 'text-blue-800',  titleText: 'text-blue-800' },
    pending:     { border: 'border-amber-500', chipBg: 'bg-amber-100', chipText: 'text-amber-800', titleText: 'text-amber-800' },
    rescheduled: { border: 'border-yellow-500',chipBg: 'bg-yellow-100',chipText: 'text-yellow-800',titleText: 'text-yellow-800' },
    in_progress: { border: 'border-indigo-500',chipBg: 'bg-indigo-100',chipText: 'text-indigo-800',titleText: 'text-indigo-800' },
    completed:   { border: 'border-green-500', chipBg: 'bg-green-100', chipText: 'text-green-800', titleText: 'text-green-800' },
    cancelled:   { border: 'border-red-500',   chipBg: 'bg-red-100',   chipText: 'text-red-800',   titleText: 'text-red-800' },
    canceled:    { border: 'border-red-500',   chipBg: 'bg-red-100',   chipText: 'text-red-800',   titleText: 'text-red-800' },
    default:     { border: 'border-gray-400',  chipBg: 'bg-gray-100',  chipText: 'text-gray-800',  titleText: 'text-gray-800' },
  };
  const statusKey = (interview.status || 'default').toLowerCase();
  const styles = statusStyles[statusKey] || statusStyles.default;
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <div className={`border-l-4 pl-3 ${styles.border}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link to={`/interview/${interview.id}`}>
              <h2 className={`text-l font-semibold mb-2 ${styles.titleText} truncate`}>{interview.title}</h2>
            </Link>
            <div className="flex items-center mb-2">
              <div className={`${styles.chipBg} ${styles.chipText} rounded-full px-2 py-0.5 text-xs font-semibold mr-2`}>
                {interview.status.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {interview.jobTitle}
              </div>
            </div>
            {interview.description && (
              <div className="text-xs text-gray-600 line-clamp-2">
                {interview.description}
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col gap-1 text-xs text-gray-600 w-64 shrink-0">
            <div className="flex items-center">
              <UserIconSolid className="h-3 w-3 mr-1" />
              <span className="font-medium">Applicant:</span>
              <span className="ml-1 truncate" title={interview.applicantName}>{interview.applicantName}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span className="font-medium">Date:</span>
              <span className="ml-1">{formatDate(interview.scheduledDate)}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              <span className="font-medium">Time:</span>
              <span className="ml-1">{formatTime(interview.scheduledDate)}</span>
            </div>
          </div>

          <div className="flex items-start">
            <ActionsMenu
              buttonAriaLabel="Interview actions"
              align="right"
              menuWidthPx={192}
              items={(() => {
                const items: ActionsMenuItem[] = [
                  { label: 'View', href: `/interview/${interview.id}`, icon: <EyeIcon className="w-4 h-4" /> },
                ];
                if (isActive) {
                  items.push({ label: 'Applicant', href: `/applicants/${interview.applicantId}`, icon: <UserIconOutline className="w-4 h-4" /> });
                }
                return items;
              })()}
            />
          </div>
        </div>

        {/* Info rows for small screens */}
        <div className="mt-3 md:hidden">
          <div className="flex items-center text-xs text-gray-600 mb-1">
            <UserIconSolid className="h-3 w-3 mr-1" />
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
                  className="inline-flex items-center bg-sky-200 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                >
                  <UserIconSolid className="h-2 w-2 mr-1" />
                  {interviewer.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InterviewCard;
