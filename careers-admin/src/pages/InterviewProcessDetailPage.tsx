import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import interviewProcessService, { InterviewProcess } from '../services/interviewProcessService';
import { formatDate } from '../utils/dateUtils';
import { toast } from 'react-toastify';

const InterviewProcessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interviewProcess, setInterviewProcess] = useState<InterviewProcess | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

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

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this interview process?')) {
      try {
        await interviewProcessService.deleteProcess(id);
        toast.success('Interview process deleted successfully');
        navigate('/interviews?tab=processes');
      } catch (err) {
        console.error('Error deleting interview process:', err);
        toast.error('Failed to delete interview process');
      }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate('/interviews?tab=processes')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 inline-block">{interviewProcess.jobRole.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/interview-processes/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-4 text-blue-800">Process Details</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Job Role</span>
                <p className="font-medium text-lg">{interviewProcess.jobRole.title}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Created By:</span>
              <p className="font-medium">
                {interviewProcess.createdBy 
                  ? `${interviewProcess.createdBy.name} (${interviewProcess.createdBy.email})` 
                  : 'System'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Created On:</span>
              <p className="font-medium">{formatDate(interviewProcess.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Last Updated:</span>
              <p className="font-medium">{formatDate(interviewProcess.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white shadow rounded-lg overflow-hidden border-t-4 border-blue-500">
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-blue-800">Interview Stages</h2>
                <p className="text-gray-600 text-sm mt-1">
                  This process has {interviewProcess.stages.length} {interviewProcess.stages.length === 1 ? 'stage' : 'stages'}
                </p>
              </div>
              <div className="bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-semibold">
                {interviewProcess.stages.length} {interviewProcess.stages.length === 1 ? 'Stage' : 'Stages'}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50">
              <ul className="divide-y divide-gray-200">
                {interviewProcess.stages.map((stage, index) => (
                  <li 
                    key={index}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 ${activeStageIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => setActiveStageIndex(index)}
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{stage.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stage.considerations.length} {stage.considerations.length === 1 ? 'consideration' : 'considerations'}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="w-full md:w-2/3 p-6">
              {interviewProcess.stages.length > 0 ? (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
                      {activeStageIndex + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-blue-800">
                      {interviewProcess.stages[activeStageIndex].title}
                    </h3>
                  </div>
                  
                  <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Description
                    </h4>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded">
                      {interviewProcess.stages[activeStageIndex].description}
                    </p>
                  </div>
                  
                  <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Considerations for Interviewers
                    </h4>
                    {interviewProcess.stages[activeStageIndex].considerations.length > 0 ? (
                      <div className="space-y-3">
                        {interviewProcess.stages[activeStageIndex].considerations.map((consideration, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-100">
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <h5 className="font-medium text-gray-800">{consideration.title}</h5>
                                <p className="text-sm text-gray-600 mt-1">{consideration.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic bg-gray-50 p-3 rounded">No considerations added for this stage.</p>
                    )}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Template
                    </h4>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-inner">
                      <div 
                        className="prose max-w-none" 
                        dangerouslySetInnerHTML={{ __html: interviewProcess.stages[activeStageIndex].emailTemplate }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 font-medium">No stages defined for this interview process.</p>
                  <p className="text-gray-400 text-sm mt-1">Edit this process to add interview stages.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewProcessDetailPage;
