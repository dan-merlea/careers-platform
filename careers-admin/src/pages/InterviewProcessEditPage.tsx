import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import InterviewProcessForm from '../components/interviews/InterviewProcessForm';
import interviewProcessService, { 
  InterviewProcess, 
  InterviewProcessUpdateDto 
} from '../services/interviewProcessService';

const InterviewProcessEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interviewProcess, setInterviewProcess] = useState<InterviewProcess | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewProcess = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await interviewProcessService.getProcess(id);
        setInterviewProcess(data);
      } catch (err) {
        console.error('Error fetching interview process:', err);
        setError('Failed to load interview process. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterviewProcess();
  }, [id]);

  const handleSubmit = async (formData: InterviewProcessUpdateDto) => {
    if (!id) return;
    
    try {
      await interviewProcessService.updateProcess(id, formData);
      toast.success('Interview process updated successfully');
      navigate('/interviews?tab=processes');
    } catch (err) {
      console.error('Error updating interview process:', err);
      setError('Failed to update interview process. Please try again.');
      throw err; // Re-throw to let the form component handle the error
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

  if (!interviewProcess) {
    return (
      <div className="p-6">
        <div className="bg-red-100 p-4 rounded text-red-700">
          {error || 'Interview process not found'}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/interviews?tab=processes')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Interview Processes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Interview Process</h1>
        <p className="text-gray-600 mt-1">
          Update the interview process details and stages.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <InterviewProcessForm 
          initialData={interviewProcess} 
          onSubmit={handleSubmit} 
          isEdit={true} 
        />
      </div>
    </div>
  );
};

export default InterviewProcessEditPage;
