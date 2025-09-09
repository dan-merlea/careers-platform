import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import interviewProcessService, { InterviewProcess } from '../services/interviewProcessService';
import { toast } from 'react-toastify';

const InterviewsPage: React.FC = () => {
  const [interviewProcesses, setInterviewProcesses] = useState<InterviewProcess[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewProcesses = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await interviewProcessService.getAllProcesses();
        setInterviewProcesses(data);
      } catch (err) {
        console.error('Error fetching interview processes:', err);
        setError('Failed to load interview processes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterviewProcesses();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this interview process?')) {
      try {
        await interviewProcessService.deleteProcess(id);
        setInterviewProcesses(prevProcesses => 
          prevProcesses.filter(process => process.id !== id)
        );
        toast.success('Interview process deleted successfully');
      } catch (err) {
        console.error('Error deleting interview process:', err);
        toast.error('Failed to delete interview process');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Interview Processes</h1>
        <Link
          to="/interviews/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Process
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded text-red-700 mb-6">
          {error}
        </div>
      )}

      {interviewProcesses.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No interview processes found. Create your first interview process to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewProcesses.map((process) => (
            <div key={process.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="border-l-4 border-blue-500 p-6">
                <h2 className="text-xl font-semibold mb-3 text-blue-800">{process.jobRole.title}</h2>
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2">
                    {process.stages.length} {process.stages.length === 1 ? 'Stage' : 'Stages'}
                  </div>
                  {process.createdBy && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {process.createdBy.name}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Created {new Date(process.createdAt).toLocaleDateString()}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/interviews/${process.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    View
                  </Link>
                  <div className="flex space-x-2">
                    <Link
                      to={`/interviews/${process.id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(process.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewsPage;
