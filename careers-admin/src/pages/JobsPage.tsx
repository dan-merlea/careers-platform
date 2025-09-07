import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, EyeIcon, ArchiveBoxIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import jobService, { Job, JobStatus } from '../services/jobService';
import jobBoardsService, { JobBoard } from '../services/jobBoardsService';
import { departmentService, Department } from '../services/departmentService';
import { getStatusBadgeClass, getPrettyStatus } from '../utils/jobStatusUtils';
import ScrollableTable from '../components/common/ScrollableTable';

const JobsPage: React.FC = () => {
  const { userRole } = useAuth();
  const { company } = useCompany();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [jobBoards, setJobBoards] = useState<Map<string, JobBoard>>(new Map());
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'pending'>('all');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [jobToReject, setJobToReject] = useState<Job | null>(null);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobBoardFilter, setJobBoardFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  
  // No longer need scroll states as they're handled by the ScrollableTable component

  // Check if approval workflow is set to headcount
  const isHeadcountApprovalWorkflow = company?.settings?.approvalType === 'headcount';

  // Fetch jobs, job boards, and departments on component mount
  useEffect(() => {
    fetchJobs();
    fetchJobBoards();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // No longer need to initialize scroll dimensions as they're handled by the ScrollableTable component

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

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      // Don't set error here to avoid blocking the UI if only departments fail to load
    }
  };

  // Apply filters to jobs
  const applyFilters = (jobsToFilter: Job[]) => {
    return jobsToFilter.filter(job => {
      // Filter by status
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false;
      }
      
      // Filter by job board
      if (jobBoardFilter !== 'all' && job.jobBoardId !== jobBoardFilter) {
        return false;
      }
      
      // Filter by department
      if (departmentFilter !== 'all') {
        // Check if job has the selected department
        const hasDepartment = job.departments.some(dept => dept.id === departmentFilter);
        if (!hasDepartment) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Fetch jobs based on view mode
  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let data;
      if (viewMode === 'pending') {
        // Fetch jobs that need approval (role is determined from JWT token)
        data = await jobService.getPendingApprovalJobs();
      } else {
        // Fetch all jobs
        data = await jobService.getAllJobs();
      }
      setJobs(data);
      setFilteredJobs(applyFilters(data));
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
  
  // Effect to reapply filters when filter values change
  useEffect(() => {
    if (jobs.length > 0) {
      setFilteredJobs(applyFilters(jobs));
    }
  }, [statusFilter, jobBoardFilter, departmentFilter, jobs]);

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

  // Scroll-related functions are now handled by the ScrollableTable component

  // Open rejection modal
  const openRejectModal = (job: Job) => {
    setJobToReject(job);
    setIsRejecting(true);
    setRejectionReason('');
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
      await fetchJobs();
      closeRejectModal();
    } catch (err) {
      console.error('Error rejecting job:', err);
      setError('Failed to reject job. Please try again.');
    }
  };

  // Handle job status change (submit for approval/publish/archive/approve)
  const handleStatusChange = async (job: Job, action: 'submit' | 'publish' | 'archive' | 'approve') => {
    try {
      if (action === 'submit') {
        await jobService.submitForApproval(job.id);
      } else if (action === 'publish') {
        await jobService.publishJob(job.id);
      } else if (action === 'archive') {
        await jobService.archiveJob(job.id);
      } else if (action === 'approve') {
        await jobService.approveJob(job.id);
      }
      await fetchJobs();
    } catch (err) {
      console.error(`Error ${action}ing job:`, err);
      setError(`Failed to ${action} job. Please try again.`);
    }
  };

  // Status badge color is now imported from jobStatusUtils

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Openings</h1>
        {/* Hide Create Job button when headcount approval workflow is active */}
        {!isHeadcountApprovalWorkflow && (
          <Link
            to="/jobs/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Job
          </Link>
        )}
      </div>
      <div className="mb-6">
        <div className="mt-2 flex space-x-4">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Openings
          </button>
          <button
            onClick={() => setViewMode('pending')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Requests
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {viewMode === 'all' 
            ? 'Manage all job openings. To create a new opening, please navigate to the specific job board page.' 
            : 'Review and approve or reject job requests for departments where you have approval authority.'}
        </p>
      </div>

      {/* Filters - Only show in 'all' view */}
      {viewMode === 'all' && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Statuses</option>
                <option value={JobStatus.DRAFT}>Draft</option>
                <option value={JobStatus.PENDING_APPROVAL}>Pending Approval</option>
                <option value={JobStatus.APPROVED}>Approved</option>
                <option value={JobStatus.PUBLISHED}>Published</option>
                <option value={JobStatus.ARCHIVED}>Archived</option>
              </select>
            </div>

            {/* Job Board Filter */}
            <div>
              <label htmlFor="jobBoardFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Job Board
              </label>
              <select
                id="jobBoardFilter"
                value={jobBoardFilter}
                onChange={(e) => setJobBoardFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Job Boards</option>
                {Array.from(jobBoards.values()).map(board => (
                  <option key={board._id} value={board._id}>
                    {board.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label htmlFor="departmentFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="departmentFilter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !filteredJobs || filteredJobs.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">
            {viewMode === 'pending' 
              ? 'No jobs pending your approval at this time.' 
              : 'No jobs found. Create your first job to get started.'}
          </p>
        </div>
      ) : (
        <ScrollableTable>
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              {viewMode === 'all' && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departments
              </th>
              {viewMode === 'all' && (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Board
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {viewMode === 'pending' ? 'Submitted On' : 'Last Updated'}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs?.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/jobs/${job.id}`} className="block">
                    <div className="text-sm font-medium text-gray-900 hover:text-blue-600">{job.title}</div>
                    {job.internalId !== "" ? <div className="text-sm text-gray-500">ID: {job.internalId}</div> : <></>}
                  </Link>
                </td>
                {viewMode === 'all' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.location}</div>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {job.departments.length > 0 
                      ? job.departments.map(dept => dept.name).join(', ')
                      : 'None'}
                  </div>
                </td>
                {viewMode === 'all' && (
                  <>
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
                      <div className="relative group">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
                          {getPrettyStatus(job.status)}
                        </span>
                        {job.status === JobStatus.REJECTED && job.rejectionReason && (
                          <div className="fixed z-50 invisible group-hover:visible bg-gray-800 text-white text-sm rounded p-2 mt-1 w-64 shadow-lg transform -translate-x-1/4 translate-y-1">
                            <div className="font-semibold mb-1">Rejection Reason:</div>
                            <div>{job.rejectionReason}</div>
                          </div>
                        )}
                      </div>
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(viewMode === 'pending' ? job.updatedAt : job.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* Show different actions based on view mode */}
                    {viewMode === 'all' ? (
                      <>
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
                          <PencilIcon className="h-5 w-5" />
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
                        {job.status !== JobStatus.ARCHIVED && job.status !== JobStatus.DRAFT && (
                          <button
                            onClick={() => handleStatusChange(job, 'archive')}
                            className="text-gray-600 hover:text-gray-900"
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
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Only show view, approve, reject in requests tab */}
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleStatusChange(job, 'approve')}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openRejectModal(job)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </ScrollableTable>
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

export default JobsPage;
