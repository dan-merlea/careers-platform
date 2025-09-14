import React, { useState, useEffect } from 'react';
import { UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Interviewer } from '../../services/interviewService';

interface EditInterviewersModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewers: Interviewer[];
  onSave: (interviewers: Interviewer[]) => void;
  isLoading: boolean;
}

const EditInterviewersModal: React.FC<EditInterviewersModalProps> = ({
  isOpen,
  onClose,
  interviewers,
  onSave,
  isLoading
}) => {
  const [selectedInterviewers, setSelectedInterviewers] = useState<Interviewer[]>([]);
  const [newInterviewer, setNewInterviewer] = useState<{ userId: string; name: string }>({ userId: '', name: '' });
  
  useEffect(() => {
    if (isOpen) {
      setSelectedInterviewers([...interviewers]);
    }
  }, [isOpen, interviewers]);
  
  const handleAddInterviewer = () => {
    if (newInterviewer.userId && newInterviewer.name) {
      // Check if interviewer already exists
      if (!selectedInterviewers.some(i => i.userId === newInterviewer.userId)) {
        setSelectedInterviewers([...selectedInterviewers, { ...newInterviewer }]);
      }
      setNewInterviewer({ userId: '', name: '' });
    }
  };
  
  const handleRemoveInterviewer = (userId: string) => {
    setSelectedInterviewers(selectedInterviewers.filter(i => i.userId !== userId));
  };
  
  const handleSave = () => {
    onSave(selectedInterviewers);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Edit Interviewers
                </h3>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Interviewers</h4>
                  {selectedInterviewers.length === 0 ? (
                    <p className="text-sm text-gray-500">No interviewers assigned</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedInterviewers.map((interviewer) => (
                        <li key={interviewer.userId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                              {interviewer.name.charAt(0).toUpperCase()}
                            </span>
                            <span>{interviewer.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveInterviewer(interviewer.userId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Interviewer</h4>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="User ID"
                        value={newInterviewer.userId}
                        onChange={(e) => setNewInterviewer({ ...newInterviewer, userId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newInterviewer.name}
                        onChange={(e) => setNewInterviewer({ ...newInterviewer, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddInterviewer}
                      disabled={!newInterviewer.userId || !newInterviewer.name}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-300"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInterviewersModal;
