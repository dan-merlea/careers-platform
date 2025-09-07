import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, ArchiveBoxIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import jobService, { Job, JobStatus } from '../services/jobService';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const jobData = await jobService.getJob(id);
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);

  // Handle job deletion
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await jobService.deleteJob(id);
      navigate('/jobs');
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
    }
  };

  // Handle job status change (publish/archive/submit for approval)
  const handleStatusChange = async (action: 'publish' | 'archive' | 'submit-for-approval') => {
    if (!id) return;
    
    try {
      let updatedJob: Job;
      if (action === 'publish') {
        // If job is in draft status, submit for approval first
        if (job?.status === JobStatus.DRAFT) {
          updatedJob = await jobService.submitForApproval(id);
          setJob(updatedJob);
          setError(null);
          return;
        }
        // Otherwise proceed with publishing (only works for approved jobs)
        updatedJob = await jobService.publishJob(id);
      } else if (action === 'archive') {
        updatedJob = await jobService.archiveJob(id);
      } else if (action === 'submit-for-approval') {
        updatedJob = await jobService.submitForApproval(id);
      } else {
        throw new Error(`Unknown action: ${action}`);
      }
      setJob(updatedJob);
    } catch (err) {
      console.error(`Error performing action ${action} on job:`, err);
      setError(`Failed to ${action.replace('-', ' ')} job. Please try again.`);
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PUBLISHED:
        return 'bg-green-100 text-green-800';
      case JobStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
      case JobStatus.APPROVED:
        return 'bg-blue-100 text-blue-800';
      case JobStatus.PENDING_APPROVAL:
        return 'bg-purple-100 text-purple-800';
      case JobStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="bg-red-100 p-4 rounded text-red-700">
          {error || 'Job not found'}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/jobs/${job.id}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            Edit
          </Link>
          
          {/* Publish/Submit button - shown for DRAFT and APPROVED jobs */}
          {(job.status === JobStatus.DRAFT || job.status === JobStatus.APPROVED) && (
            <button
              onClick={() => handleStatusChange('publish')}
              className={`flex items-center px-4 py-2 ${job.status === JobStatus.DRAFT ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={job.status === JobStatus.DRAFT ? "M9 5l7 7-7 7" : "M5 13l4 4L19 7"} />
              </svg>
              {job.status === JobStatus.DRAFT ? 'Submit for Review' : 'Publish'}
            </button>
          )}
          
          {/* Archive button - not shown for already archived jobs */}
          {job.status !== JobStatus.ARCHIVED && (
            <button
              onClick={() => handleStatusChange('archive')}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              <ArchiveBoxIcon className="w-5 h-5 mr-2" />
              Archive
            </button>
          )}
          <button
            onClick={() => setIsDeleting(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <div>
              <span className="text-sm text-gray-500">Internal ID:</span>
              <p className="font-medium">{job.internalId}</p>
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
                {job.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <span className="text-sm text-gray-500">Location:</span>
              <p className="font-medium">{job.location}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Company:</span>
              <p className="font-medium">{job.company.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <span className="text-sm text-gray-500">Departments:</span>
              <p className="font-medium">
                {job.departments.length > 0 
                  ? job.departments.map(dept => dept.name).join(', ')
                  : 'None'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Offices:</span>
              <p className="font-medium">
                {job.offices.length > 0 
                  ? job.offices.map(office => `${office.name} (${office.location})`).join(', ')
                  : 'None'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-sm text-gray-500">Last Updated:</span>
            <p className="font-medium">{new Date(job.updatedAt).toLocaleString()}</p>
          </div>

          {job.publishedDate && (
            <div className="mb-6">
              <span className="text-sm text-gray-500">Published Date:</span>
              <p className="font-medium">{new Date(job.publishedDate).toLocaleString()}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-2">Job Description</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.content }} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Job</h2>
            <p className="mb-6">
              Are you sure you want to delete the job "{job.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleting(false)}
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

export default JobDetailPage;
