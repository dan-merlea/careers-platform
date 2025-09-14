import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, UserIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { api } from '../../utils/api';

interface Interviewer {
  userId: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  onScheduled: () => void;
  processId?: string; // Interview process ID
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  candidateEmail,
  onScheduled,
  processId,
}) => {
  const [title, setTitle] = useState<string>(`Interview with ${candidateName}`);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  // Fetch company users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await api.get<User[]>('/users');
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load company users');
      }
    };

    if (isOpen) {
      fetchUsers();
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
      
      // Set default time to 10:00 AM
      setTime('10:00');
    }
  }, [isOpen]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddInterviewer = (user: User) => {
    if (selectedUsers.length >= 10) {
      setError('Maximum 10 interviewers can be added');
      return;
    }
    
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    
    setSearchTerm('');
    setShowUserDropdown(false);
  };

  const handleRemoveInterviewer = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!title.trim()) {
      setError('Interview title is required');
      return;
    }
    
    if (!date) {
      setError('Date is required');
      return;
    }
    
    if (!time) {
      setError('Time is required');
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError('At least one interviewer is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Combine date and time into a single Date object
      const scheduledDate = new Date(`${date}T${time}`);
      
      // Format interviewers
      const interviewersList = selectedUsers.map(user => ({
        userId: user.id,
        name: user.name,
      }));
      
      // Call the API to schedule the interview
      await api.post(`/job-applications/${applicationId}/interviews`, {
        scheduledDate,
        title,
        description,
        interviewers: interviewersList,
        processId, // Include the process ID if available
      });
      
      onScheduled();
      onClose();
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSubmitting && onClose()}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Schedule Interview
            </h2>
            <button
              onClick={() => !isSubmitting && onClose()}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Interview Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    disabled={isSubmitting}
                    required
                    onClick={(e) => {
                      // Modern browsers support showPicker, but TypeScript doesn't recognize it yet
                      const input = e.currentTarget as HTMLInputElement;
                      if ('showPicker' in input) {
                        (input as any).showPicker();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500"
                    onClick={() => {
                      const dateInput = document.getElementById('date') as HTMLInputElement;
                      if (dateInput && 'showPicker' in dateInput) {
                        (dateInput as any).showPicker();
                      }
                    }}
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                placeholder="Add interview details, agenda, or instructions..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interviewers * (max 10)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowUserDropdown(true);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for team members..."
                  disabled={isSubmitting || selectedUsers.length >= 10}
                />
                <UserIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                
                {showUserDropdown && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredUsers.length > 0 ? (
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
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No users found</div>
                    )}
                  </div>
                )}
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center text-sm"
                    >
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterviewer(user.id)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        disabled={isSubmitting}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Note:</span> The candidate's email ({candidateEmail}) will be included in the calendar invite.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default InterviewScheduleModal;
