import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ArchiveBoxIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import jobService, { Job, JobStatus } from '../services/jobService';
import jobBoardsService, { JobBoard } from '../services/jobBoardsService';

const JobsPage: React.FC = () => {
  const { userRole } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobBoards, setJobBoards] = useState<Map<string, JobBoard>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'pending'>('all');

  // Fetch jobs and job boards on component mount
  useEffect(() => {
    fetchJobs();
    fetchJobBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all job boards and create a map for quick lookup
  const fetchJobBoards = async () => {
    try {
      const data = await jobBoardsService.getAllJobBoards();
      const boardsMap = new Map<string, JobBoard>();
      data.forEach(board => {
        boardsMap.set(board._id, board);
      });
      setJobBoards(boardsMap);
    } catch (err) {
      console.error('Error fetching job boards:', err);
      // Don't set error here to avoid blocking the UI if only job boards fail to load
    }
  };

  // Fetch jobs based on view mode
  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let data;
      if (viewMode === 'pending' && userRole) {
        // Fetch jobs that need approval by this user's role
        data = await jobService.getJobsForApproval(userRole);
      } else {
        // Fetch all jobs
        data = await jobService.getAllJobs();
      }
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effect to refetch jobs when view mode or user role changes
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, userRole]);  

  // Open delete confirmation modal
  const openDeleteModal = (job: Job) => {
    setJobToDelete(job);
    setIsDeleting(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleting(false);
    setJobToDelete(null);
  };

  // Handle job deletion
  const handleDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      await jobService.deleteJob(jobToDelete.id);
      await fetchJobs();
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
    }
  };

  // Handle job status change (submit for approval/publish/archive/approve/reject)
  const handleStatusChange = async (job: Job, action: 'submit' | 'publish' | 'archive' | 'approve' | 'reject') => {
    try {
      if (action === 'submit') {
        await jobService.submitForApproval(job.id);
      } else if (action === 'publish') {
        await jobService.publishJob(job.id);
      } else if (action === 'archive') {
        await jobService.archiveJob(job.id);
      } else if (action === 'approve') {
        await jobService.approveJob(job.id);
      } else if (action === 'reject') {
        // For simplicity, using a basic prompt for rejection reason
        const reason = prompt('Please provide a reason for rejection:');
        if (reason === null) return; // User cancelled
        await jobService.rejectJob(job.id, reason);
      }
      await fetchJobs();
    } catch (err) {
      console.error(`Error ${action}ing job:`, err);
      setError(`Failed to ${action} job. Please try again.`);
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: JobStatus) => {
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
          <div className="mt-2 flex space-x-4">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setViewMode('pending')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Pending Approval
            </button>
          </div>
        </div>
        <Link
          to="/jobs/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Job
        </Link>
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
      ) : jobs.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">No jobs found. Create your first job to get started.</p>
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
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departments
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Board
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    {job.internalId !== "" ? <div className="text-sm text-gray-500">ID: {job.internalId}</div> : <></>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {job.departments.length > 0 
                        ? job.departments.map(dept => dept.name).join(', ')
                        : 'None'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {job.jobBoardId && jobBoards.has(job.jobBoardId) ? (
                        <div className="flex items-center">
                          <span>{jobBoards.get(job.jobBoardId)?.title || 'Unknown'}</span>
                          {jobBoards.get(job.jobBoardId)?.isExternal && (
                            <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                              {jobBoards.get(job.jobBoardId)?.source}
                            </span>
                          )}
                        </div>
                      ) : (
                        'None'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
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
                      <Link
                        to={`/jobs/${job.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      {job.status === JobStatus.DRAFT && (
                        <button
                          onClick={() => handleStatusChange(job, 'submit')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Submit for Approval"
                        >
                          <ClockIcon className="h-5 w-5" />
                        </button>
                      )}
                      {job.status === JobStatus.PENDING_APPROVAL && userRole && (
                        <>
                          <button
                            onClick={() => handleStatusChange(job, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(job, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {job.status === JobStatus.APPROVED && (
                        <button
                          onClick={() => handleStatusChange(job, 'publish')}
                          className="text-green-600 hover:text-green-900"
                          title="Publish"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      {job.status !== JobStatus.ARCHIVED && (
                        <button
                          onClick={() => handleStatusChange(job, 'archive')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Archive"
                        >
                          <ArchiveBoxIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(job)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && jobToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Job</h2>
            <p className="mb-6">
              Are you sure you want to delete the job "{jobToDelete.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
