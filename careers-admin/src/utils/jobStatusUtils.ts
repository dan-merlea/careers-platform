import { JobStatus } from '../services/jobService';

/**
 * Returns the appropriate Tailwind CSS classes for a job status badge
 * @param status The job status
 * @returns Tailwind CSS classes for styling the status badge
 */
export const getStatusBadgeClass = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.PUBLISHED:
      return 'bg-green-100 text-green-800';
    case JobStatus.ARCHIVED:
      return 'bg-gray-100 text-gray-800';
    case JobStatus.PENDING_APPROVAL:
      return 'bg-blue-100 text-blue-800';
    case JobStatus.APPROVED:
      return 'bg-emerald-100 text-emerald-800';
    case JobStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};
