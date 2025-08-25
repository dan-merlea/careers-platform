import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobForm from '../components/jobs/JobForm';
import jobService, { JobCreateDto, JobUpdateDto } from '../services/jobService';

const JobCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: JobCreateDto | JobUpdateDto) => {
    try {
      await jobService.createJob(formData as JobCreateDto);
      navigate('/jobs');
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/jobs');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Job</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <JobForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default JobCreatePage;
