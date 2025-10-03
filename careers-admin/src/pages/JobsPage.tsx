import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, EyeIcon, ArchiveBoxIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import jobService, { Job, JobStatus } from '../services/jobService';
import jobBoardsService, { JobBoard } from '../services/jobBoardsService';
import { departmentService, Department } from '../services/departmentService';
import { getStatusBadgeClass, getPrettyStatus } from '../utils/jobStatusUtils';
import { formatDate } from '../utils/dateUtils';
import ScrollableTable from '../components/common/ScrollableTable';
import ActionsMenu, { ActionsMenuItem } from '../components/common/ActionsMenu';
import Select from '../components/common/Select';
import Button from '../components/common/Button';

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
  // Actions menu handled by reusable component
  
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
  const applyFilters = useCallback((jobsToFilter: Job[]) => {
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
  }, [statusFilter, jobBoardFilter, departmentFilter]);
  
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
  }, [statusFilter, jobBoardFilter, departmentFilter, jobs, applyFilters]);

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
        <div className="mt-2 flex space-x-2">
          <Button onClick={() => setViewMode('all')} variant={viewMode === 'all' ? 'primary' : 'white'} className="text-sm">
            All Openings
          </Button>
          <Button onClick={() => setViewMode('pending')} variant={viewMode === 'pending' ? 'primary' : 'white'} className="text-sm">
            Requests
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {viewMode === 'all' 
            ? 'Manage all job openings. To create a new opening, please navigate to the specific job board page.' 
            : 'Review and approve or reject job requests for departments where you have approval authority.'}
        </p>
      </div>

      {/* Filters - Only show in 'all' view */}
      {viewMode === 'all' && (
        <div className="mb-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={statusFilter === 'all' ? undefined : statusFilter}
                onChange={(val) => setStatusFilter(val || 'all')}
                allowEmpty
                placeholder="All Statuses"
                className="w-full"
                options={[
                  { label: 'Draft', value: JobStatus.DRAFT },
                  { label: 'Pending Approval', value: JobStatus.PENDING_APPROVAL },
                  { label: 'Approved', value: JobStatus.APPROVED },
                  { label: 'Published', value: JobStatus.PUBLISHED },
                  { label: 'Archived', value: JobStatus.ARCHIVED },
                ]}
              />
            </div>

            {/* Job Board Filter */}
            <div>
              <label htmlFor="jobBoardFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Job Board
              </label>
              <Select
                value={jobBoardFilter === 'all' ? undefined : jobBoardFilter}
                onChange={(val) => setJobBoardFilter(val || 'all')}
                allowEmpty
                placeholder="All Job Boards"
                className="w-full"
                options={Array.from(jobBoards.values()).map(board => ({ label: board.title, value: String(board._id ?? '') }))}
              />
            </div>

            {/* Department Filter */}
            <div>
              <label htmlFor="departmentFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Department
              </label>
              <Select
                value={departmentFilter === 'all' ? undefined : departmentFilter}
                onChange={(val) => setDepartmentFilter(val || 'all')}
                allowEmpty
                placeholder="All Departments"
                className="w-full"
                options={departments.map(dept => ({ label: dept.title, value: String((dept as any)._id ?? (dept as any).id ?? '') }))}
              />
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
                  {formatDate(viewMode === 'pending' ? job.updatedAt : job.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <div className="flex justify-end">
                    <ActionsMenu
                      buttonAriaLabel="Job actions"
                      buttonContent={<EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />}
                      align="right"
                      menuWidthPx={192}
                      items={(() => {
                        const items: ActionsMenuItem[] = [
                          { label: 'View', href: `/jobs/${job.id}`, icon: <EyeIcon className="w-4 h-4" /> },
                        ];
                        if (viewMode === 'all') {
                          items.push({ label: 'Edit', href: `/jobs/${job.id}/edit`, icon: <PencilIcon className="w-4 h-4" /> });
                          if (job.status === JobStatus.DRAFT) {
                            items.push({ label: 'Submit for approval', onClick: () => handleStatusChange(job, 'submit'), icon: <ClockIcon className="w-4 h-4" /> });
                          }
                          if (job.status === JobStatus.APPROVED) {
                            items.push({ label: 'Publish', onClick: () => handleStatusChange(job, 'publish'), icon: <CheckCircleIcon className="w-4 h-4" /> });
                          }
                          if (job.status !== JobStatus.ARCHIVED && job.status !== JobStatus.DRAFT) {
                            items.push({ label: 'Archive', onClick: () => handleStatusChange(job, 'archive'), icon: <ArchiveBoxIcon className="w-4 h-4" /> });
                          }
                          items.push({ label: 'Delete', onClick: () => openDeleteModal(job), icon: <TrashIcon className="w-4 h-4" />, variant: 'danger' });
                        } else {
                          items.push({ label: 'Approve', onClick: () => handleStatusChange(job, 'approve'), icon: <CheckCircleIcon className="w-4 h-4" />, variant: 'success' });
                          items.push({ label: 'Reject', onClick: () => openRejectModal(job), icon: <XCircleIcon className="w-4 h-4" />, variant: 'danger' });
                        }
                        return items;
                      })()}
                    />
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
              <Button onClick={closeDeleteModal} variant="white">
                Cancel
              </Button>
              <Button onClick={handleDelete} variant="primary">
                Delete
              </Button>
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
              <Button onClick={closeRejectModal} variant="white">
                Cancel
              </Button>
              <Button onClick={handleReject} disabled={!rejectionReason.trim()} variant="primary">
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
