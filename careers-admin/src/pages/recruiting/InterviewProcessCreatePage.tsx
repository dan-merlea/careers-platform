import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InterviewProcessForm from '../../components/interviews/InterviewProcessForm';
import interviewProcessService, { InterviewProcessCreateDto, InterviewProcessUpdateDto } from '../../services/interviewProcessService';

const InterviewProcessCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: InterviewProcessCreateDto | InterviewProcessUpdateDto) => {
    try {
      // We know this is a create operation, so we can safely cast to InterviewProcessCreateDto
      await interviewProcessService.createProcess(formData as InterviewProcessCreateDto);
      toast.success('Interview process created successfully');
      navigate('/interviews?tab=processes');
    } catch (err) {
      console.error('Error creating interview process:', err);
      setError('Failed to create interview process. Please try again.');
      throw err; // Re-throw to let the form component handle the error
    }
  };

  return (
    <div className="py-3">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Create Interview Process</h1>
        <p className="text-gray-600 mt-1">
          Define a new interview process with multiple stages for a specific job role.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <InterviewProcessForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default InterviewProcessCreatePage;
