import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, ArrowLeftIcon, CheckCircleIcon, ClockIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import jobBoardsService, { JobBoard } from '../../services/jobBoardsService';
import jobService, { Job, JobStatus } from '../../services/jobService';
import { getStatusBadgeClass } from '../../utils/jobStatusUtils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollableTable from '../../components/common/ScrollableTable';
import ActionsMenu, { ActionsMenuItem } from '../../components/common/ActionsMenu';
import { useCompany } from '../../context/CompanyContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';

const JobBoardJobsPage: React.FC = () => {
  const { jobBoardId } = useParams<{ jobBoardId: string }>();
  const navigate = useNavigate();
  const { company } = useCompany();
  
  const [jobBoard, setJobBoard] = useState<JobBoard | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [slug, setSlug] = useState<string>('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  
  // Actions menu handled by reusable component
  
  // Check if approval workflow is set to headcount
  const isHeadcountApprovalWorkflow = company?.settings?.approvalType === 'headcount';

  const fetchJobBoardDetails = useCallback(async () => {
    try {
      if (!jobBoardId) return;
      const data = await jobBoardsService.getJobBoardById(jobBoardId);
      setJobBoard(data);
    } catch (err) {
      console.error('Error fetching job board details:', err);
      setError('Failed to load job board details.');
    }
  }, [jobBoardId]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!jobBoardId) return;
      const data = await jobService.getJobsByJobBoard(jobBoardId);
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [jobBoardId]);

  useEffect(() => {
    if (jobBoardId) {
      fetchJobBoardDetails();
      fetchJobs();
    }
  }, [jobBoardId, fetchJobBoardDetails, fetchJobs]);

  // Generate slug from company name
  useEffect(() => {
    if (company?.name && !slug) {
      const generatedSlug = company.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(jobBoard?.slug || generatedSlug);
    }
  }, [company, jobBoard, slug]);

  // Apply filters whenever jobs or filter criteria change
  useEffect(() => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.internalId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location === locationFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, statusFilter, locationFilter]);

  // Get unique locations for filter dropdown
  const uniqueLocations = Array.from(new Set(jobs.map(job => job.location).filter(Boolean)));


  const handleCreateJob = () => {
    if (jobBoardId) {
      navigate(`/job-boards/${jobBoardId}/jobs/create`);
    }
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/job-boards/${jobBoardId}/jobs/${jobId}`);
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/job-boards/${jobBoardId}/jobs/${jobId}/edit`);
  };

  const openDeleteModal = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  };

  const handleDeleteJob = async () => {
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

  const handleSubmitForApproval = async (jobId: string) => {
    try {
      await jobService.submitForApproval(jobId);
      await fetchJobs();
      toast.success('Job submitted for approval');
    } catch (err) {
      console.error('Error submitting job for approval:', err);
      setError('Failed to submit job for approval. Please try again.');
    }
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      await jobService.publishJob(jobId);
      await fetchJobs();
      toast.success('Job published successfully');
    } catch (err) {
      console.error('Error publishing job:', err);
      setError('Failed to publish job. Please try again.');
    }
  };

  const handleArchiveJob = async (jobId: string) => {
    try {
      await jobService.archiveJob(jobId);
      await fetchJobs();
    } catch (err) {
      console.error('Error archiving job:', err);
      setError('Failed to archive job. Please try again.');
    }
  };

  const handleRefreshJobs = async () => {
    if (!jobBoardId) return;
    
    setIsRefreshing(true);
    try {
      const result = await jobBoardsService.refreshJobsFromATS(jobBoardId);
      await fetchJobBoardDetails();
      await fetchJobs();
      const message = `Jobs refreshed: ${result.imported} imported, ${result.updated} updated${result.deleted > 0 ? `, ${result.deleted} deleted` : ''} (${result.total} total)`;
      toast.success(message);
    } catch (err) {
      console.error('Error refreshing jobs:', err);
      toast.error('Failed to refresh jobs from ATS');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!jobBoardId) return;
    
    try {
      await jobBoardsService.updateJobBoard(jobBoardId, { slug });
      await fetchJobBoardDetails();
      setIsSettingsModalOpen(false);
      toast.success('Settings saved successfully');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save settings';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(status as JobStatus)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/job-boards')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {jobBoard ? `${jobBoard.title} Jobs` : 'Jobs'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {jobBoard && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  jobBoard.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {jobBoard.isActive ? 'Active' : 'Inactive'}
              </span>
              {jobBoard.isExternal && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    jobBoard.source === 'greenhouse'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {jobBoard.source === 'greenhouse' ? 'Greenhouse' : 'Ashby'}
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            title="Job Board Settings"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            Settings
          </button>
        </div>
        
        {jobBoard && (<div className="flex items-center gap-2">
          {jobBoard.isExternal && (
            <button
              onClick={handleRefreshJobs}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh jobs from ATS"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh from ATS'}
            </button>
          )}
          {!jobBoard.isExternal && !isHeadcountApprovalWorkflow && (
            <Button onClick={handleCreateJob} variant="secondary" leadingIcon={<PlusIcon className="w-5 h-5" />}> 
              Create Job
            </Button>
          )}
        </div>)}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val || 'all')}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Draft', value: 'draft' },
                { label: 'Pending Approval', value: 'pending_approval' },
                { label: 'Approved', value: 'approved' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' }
              ]}
              placeholder="Select status"
            />
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Select
              value={locationFilter}
              onChange={(val) => setLocationFilter(val || 'all')}
              options={[
                { label: 'All Locations', value: 'all' },
                ...uniqueLocations.map(location => ({
                  label: location,
                  value: location
                }))
              ]}
              placeholder="Select location"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <Card className="text-center">
          {jobBoard && !jobBoard.isExternal ? (
            <p className="text-gray-500">No jobs found. Create your first job to get started.</p>
          ) : (
            <p className="text-gray-500">No jobs found in this job board.</p>
          )}
        </Card>
      ) : filteredJobs.length === 0 ? (
        <Card className="text-center">
          <p className="text-gray-500">No jobs match your filters. Try adjusting your search criteria.</p>
        </Card>
      ) : (
        <Card>
          <ScrollableTable>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ maxWidth: '300px' }}>
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs?.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4" style={{ maxWidth: '300px' }}>
                      <div 
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer truncate"
                        onClick={() => handleViewJob(job.id)}
                        title={job.title}
                      >
                        {job.title}
                      </div>
                      {job.internalId !== "" ? <div className="text-sm text-gray-500">{job.internalId}</div> : <></>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <div className="flex justify-end">
                        <ActionsMenu
                          buttonAriaLabel="Job actions"
                          align="right"
                          menuWidthPx={192}
                          items={(() => {
                            const items: ActionsMenuItem[] = [
                              { label: 'View', onClick: () => handleViewJob(job.id), icon: <EyeIcon className="w-4 h-4" /> },
                            ];
                            if (jobBoard && !jobBoard.isExternal) {
                              items.push({ label: 'Edit', onClick: () => handleEditJob(job.id), icon: <PencilIcon className="w-4 h-4" /> });
                              if (job.status === 'draft') {
                                items.push({ label: 'Submit for approval', onClick: () => handleSubmitForApproval(job.id), icon: <ClockIcon className="w-4 h-4" /> });
                              }
                              if (job.status === 'approved') {
                                items.push({ label: 'Publish', onClick: () => handlePublishJob(job.id), icon: <CheckCircleIcon className="w-4 h-4" /> });
                              }
                              if (job.status === 'published') {
                                items.push({ label: 'Archive', onClick: () => handleArchiveJob(job.id), icon: (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                ) });
                              }
                              items.push({ label: 'Delete', onClick: () => openDeleteModal(job), icon: <TrashIcon className="w-4 h-4" />, variant: 'danger' });
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
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && jobToDelete && (
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
              <Button onClick={handleDeleteJob} variant="primary">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Job Board Settings</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <Input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                placeholder="job-board-slug"
                className="w-full"
              />
              <p className="mt-2 text-sm text-gray-500">
                The slug will be used to create a public link for this job board:
              </p>
              <p className="mt-1 text-sm text-blue-600 font-medium">
                https://hatchbeacon.com/job-board/{slug || 'your-slug'}
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsSettingsModalOpen(false)} variant="white">
                Cancel
              </Button>
              <Button onClick={handleSaveSettings} variant="primary">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoardJobsPage;
