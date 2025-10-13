import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import InterviewProcessForm from '../../components/interviews/InterviewProcessForm';
import interviewProcessService, { 
  InterviewProcess, 
  InterviewProcessUpdateDto 
} from '../../services/interviewProcessService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

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
      <div className="py-3">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!interviewProcess) {
    return (
      <div className="py-3">
        <Card className="bg-red-50 border-red-200">
          <p className="text-red-700">{error || 'Interview process not found'}</p>
        </Card>
        <div className="mt-4">
          <Button 
            onClick={() => navigate('/interviews?tab=processes')}
            variant="primary"
          >
            Back to Interview Processes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Interview Process</h1>
        <p className="text-gray-600 mt-1">
          Update the interview process details and stages.
        </p>
      </div>

      {error && (
        <Card className="mb-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <Card>
        <InterviewProcessForm 
          initialData={interviewProcess} 
          onSubmit={handleSubmit} 
          isEdit={true} 
        />
      </Card>
    </div>
  );
};

export default InterviewProcessEditPage;
