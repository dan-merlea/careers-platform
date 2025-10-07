import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import Card from '../components/common/Card';
import { 
  UserIcon, 
  BriefcaseIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobId: string;
  jobTitle: string;
  status: string;
  createdAt: string;
}

const ApplicantsPage: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all job applications
        const data = await api.get<any[]>('/job-applications');
        
        // Filter out rejected and hired applicants
        const activeApplicants = data
          .filter(app => app.status !== 'rejected' && app.status !== 'hired')
          .map(app => ({
            id: app._id || app.id,
            firstName: app.firstName,
            lastName: app.lastName,
            email: app.email,
            jobId: typeof app.jobId === 'string' ? app.jobId : app.jobId?._id,
            jobTitle: typeof app.jobId === 'object' ? app.jobId?.title : 'Unknown Position',
            status: app.status,
            createdAt: app.createdAt,
          }));
        
        setApplicants(activeApplicants);
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError('Failed to load applicants. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'reviewed': 'bg-indigo-100 text-indigo-800',
      'interviewing': 'bg-purple-100 text-purple-800',
      'offered': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Active Applicants</h1>
          <p className="text-sm text-gray-600 mt-1">
            {applicants.length} active {applicants.length === 1 ? 'applicant' : 'applicants'}
          </p>
        </div>
      </div>

      {applicants.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active applicants</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no active applicants at the moment.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applicants.map((applicant) => (
            <Card key={applicant.id} className="hover:shadow-xl transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(applicant.status)}`}>
                        {applicant.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{applicant.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{applicant.jobTitle}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>Applied {formatDate(applicant.createdAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Link
                    to={`/applicants/${applicant.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/jobs/${applicant.jobId}`}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    title="View Job"
                  >
                    <BriefcaseIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;
