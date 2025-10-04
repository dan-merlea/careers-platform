import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobForm from '../components/jobs/JobForm';
import jobService, { JobCreateDto, JobUpdateDto } from '../services/jobService';
import jobBoardsService, { JobBoard } from '../services/jobBoardsService';

const JobBoardJobCreatePage: React.FC = () => {
  const { jobBoardId } = useParams<{ jobBoardId: string }>();
  const navigate = useNavigate();
  
  const [jobBoard, setJobBoard] = useState<JobBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchJobBoardDetails = useCallback(async () => {
    try {
      if (!jobBoardId) return;
      setIsLoading(true);
      const data = await jobBoardsService.getJobBoardById(jobBoardId);
      setJobBoard(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching job board details:', err);
      setError('Failed to load job board details.');
      setIsLoading(false);
    }
  }, [jobBoardId]);

  useEffect(() => {
    if (jobBoardId) {
      fetchJobBoardDetails();
    }
  }, [jobBoardId, fetchJobBoardDetails]);


  const handleSubmit = async (formData: JobCreateDto | JobUpdateDto) => {
    try {
      if (!jobBoardId) {
        throw new Error('Job board ID is missing');
      }
      
      // Add the job board ID to the form data
      const jobData = {
        ...formData as JobCreateDto,
        jobBoardId: jobBoardId
      };
      
      await jobService.createJob(jobData);
      navigate(`/job-boards/${jobBoardId}/jobs`);
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job. Please try again.');
    }
  };

  const handleCancel = () => {
    if (jobBoardId) {
      navigate(`/job-boards/${jobBoardId}/jobs`);
    } else {
      navigate('/job-boards');
    }
  };

  if (isLoading) {
    return (
      <div className="py-3">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-3">
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create New Job {jobBoard && `for ${jobBoard.title}`}
        </h1>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <JobForm
          initialData={{ jobBoardId }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isFromJobBoard={true}
          jobBoardId={jobBoardId}
        />
      </div>
    </div>
  );
};

export default JobBoardJobCreatePage;
