import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import jobService, { Job } from '../services/jobService';

const JobApprovalPage: React.FC = () => {
  const { userRole } = useAuth();
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [jobToReject, setJobToReject] = useState<Job | null>(null);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  // Fetch pending approval jobs on component mount
  useEffect(() => {
    fetchPendingJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch jobs that need approval by this user's role
  const fetchPendingJobs = async () => {
    if (!userRole) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await jobService.getJobsForApproval(userRole);
      setPendingJobs(data);
    } catch (err) {
      console.error('Error fetching pending jobs:', err);
      setError('Failed to load jobs pending approval. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle job approval
  const handleApprove = async (job: Job) => {
    try {
      await jobService.approveJob(job.id);
      await fetchPendingJobs();
    } catch (err) {
      console.error('Error approving job:', err);
      setError('Failed to approve job. Please try again.');
    }
  };

  // Open rejection modal
  const openRejectModal = (job: Job) => {
    setJobToReject(job);
    setRejectionReason('');
    setIsRejecting(true);
  };

  // Close rejection modal
  const closeRejectModal = () => {
    setIsRejecting(false);
    setJobToReject(null);
    setRejectionReason('');
  };

  // Handle job rejection
  const handleReject = async () => {
    if (!jobToReject || !rejectionReason.trim()) return;
    
    try {
      await jobService.rejectJob(jobToReject.id, rejectionReason);
      await fetchPendingJobs();
      closeRejectModal();
    } catch (err) {
      console.error('Error rejecting job:', err);
      setError('Failed to reject job. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jobs Pending Approval</h1>
          <p className="text-gray-600 mt-1">
            Review and approve or reject jobs for departments where you have approval authority.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : pendingJobs.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">No jobs pending your approval at this time.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted On
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    {job.internalId !== "" ? <div className="text-sm text-gray-500">ID: {job.internalId}</div> : <></>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {job.departments.length > 0 
                        ? job.departments.map(dept => dept.name).join(', ')
                        : 'None'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleApprove(job)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openRejectModal(job)}
                        className="text-red-600 hover:text-red-900"
                        title="Reject"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejecting && jobToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Job</h2>
            <p className="mb-4">
              Please provide a reason for rejecting "{jobToReject.title}":
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
              required
            />
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${!rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApprovalPage;
