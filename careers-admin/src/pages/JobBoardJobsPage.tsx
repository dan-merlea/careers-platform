import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import jobBoardsService, { JobBoard } from '../services/jobBoardsService';
import jobService, { Job } from '../services/jobService';

const JobBoardJobsPage: React.FC = () => {
  const { jobBoardId } = useParams<{ jobBoardId: string }>();
  const navigate = useNavigate();
  
  const [jobBoard, setJobBoard] = useState<JobBoard | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

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

  const handlePublishJob = async (jobId: string) => {
    try {
      await jobService.publishJob(jobId);
      await fetchJobs();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Draft</span>;
      case 'published':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Published</span>;
      case 'archived':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Archived</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="p-6">
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
        <div>
          {jobBoard && (
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  jobBoard.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                } mr-2`}
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
        </div>
        
        {jobBoard && !jobBoard.isExternal && (
          <button
            onClick={handleCreateJob}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Job
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          {jobBoard && !jobBoard.isExternal ? (
            <p className="text-gray-500">No jobs found. Create your first job to get started.</p>
          ) : (
            <p className="text-gray-500">No jobs found in this job board.</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewJob(job.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditJob(job.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      {job.status === 'draft' && (
                        <button
                          onClick={() => handlePublishJob(job.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Publish"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      {job.status === 'published' && (
                        <button
                          onClick={() => handleArchiveJob(job.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Archive"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(job)}
                        className="text-red-600 hover:text-red-900"
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
      {isDeleteModalOpen && jobToDelete && (
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
                onClick={handleDeleteJob}
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

export default JobBoardJobsPage;
