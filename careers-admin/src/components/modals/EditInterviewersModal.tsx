import React, { useState, useEffect, useRef } from 'react';
import { UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Interviewer } from '../../services/interviewService';
import { api } from '../../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface EditInterviewersModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewers: Interviewer[];
  onSave: (interviewers: Interviewer[]) => void;
  isLoading: boolean;
  googleAuthExpired?: boolean;
}

const EditInterviewersModal: React.FC<EditInterviewersModalProps> = ({
  isOpen,
  onClose,
  interviewers,
  onSave,
  isLoading,
  googleAuthExpired = false
}) => {
  const [selectedInterviewers, setSelectedInterviewers] = useState<Interviewer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedInterviewers([...interviewers]);
      fetchUsers();
    }
  }, [isOpen, interviewers]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch company users
  const fetchUsers = async () => {
    try {
      const usersData = await api.get<User[]>('/users');
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load company users');
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddInterviewer = (user: User) => {
    if (selectedInterviewers.length >= 10) {
      setError('Maximum 10 interviewers can be added');
      return;
    }
    
    // Check if interviewer already exists
    if (!selectedInterviewers.some(i => i.userId === user.id)) {
      setSelectedInterviewers([...selectedInterviewers, { 
        userId: user.id, 
        name: user.name 
      }]);
    }
    
    setSearchTerm('');
    setShowUserDropdown(false);
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
                
                {googleAuthExpired ? (
                  <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md">
                    <p className="text-sm font-medium">⚠️ Google Calendar connection expired</p>
                    <p className="text-xs mt-1 mb-3">Your Google Calendar access has expired. Please reconnect to update this interview.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                        sessionStorage.setItem('oauthReturnUrl', window.location.pathname);
                        window.location.href = `${backendUrl}/auth/google?calendar=true`;
                      }}
                      className="px-4 py-2 bg-white border border-orange-300 rounded-md text-sm font-medium text-orange-900 hover:bg-orange-50"
                    >
                      Reconnect Google Calendar
                    </button>
                  </div>
                ) : (
                  <>
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
                
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Interviewer</h4>
                  <div className="relative" ref={dropdownRef}>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search for team members..."
                      disabled={isLoading || selectedInterviewers.length >= 10}
                    />
                    <UserIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    
                    {showUserDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {searchTerm && filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => handleAddInterviewer(user)}
                            >
                              <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          ))
                        ) : searchTerm && filteredUsers.length === 0 ? (
                          <div className="px-4 py-2 text-gray-500">No users found</div>
                        ) : users.length > 0 ? (
                          users.slice(0, 10).map((user) => (
                            <div
                              key={user.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => handleAddInterviewer(user)}
                            >
                              <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">Loading users...</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {!googleAuthExpired && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EditInterviewersModal;
