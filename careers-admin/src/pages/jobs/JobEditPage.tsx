import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import JobForm from '../../components/jobs/JobForm';
import jobService, { JobUpdateDto } from '../../services/jobService';
import Card from '../../components/common/Card';

const JobEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, jobBoardId } = useParams<{ id: string; jobBoardId?: string }>();
  const [initialData, setInitialData] = useState<JobUpdateDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const job = await jobService.getJob(id);
        
        // Transform job data to match the form structure
        setInitialData({
          internalId: job.internalId,
          title: job.title,
          companyId: job.company.id,
          location: job.location,
          content: job.content,
          departmentIds: job.departments.map(dept => dept.id),
          officeIds: job.offices.map(office => office.id),
          status: job.status
        });
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);

  const handleSubmit = async (formData: JobUpdateDto) => {
    if (!id) return;
    
    try {
      await jobService.updateJob(id, formData);
      
      // Navigate back to the appropriate page based on context
      if (jobBoardId) {
        navigate(`/job-boards/${jobBoardId}/jobs`);
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job. Please try again.');
    }
  };

  const handleCancel = () => {
    // Navigate back to the appropriate page based on context
    if (jobBoardId) {
      navigate(`/job-boards/${jobBoardId}/jobs`);
    } else {
      navigate('/jobs');
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

  return (
    <div className="py-3">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Job</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <Card>
        {initialData && (
          <JobForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit={true}
          />
        )}
      </Card>
    </div>
  );
};

export default JobEditPage;
