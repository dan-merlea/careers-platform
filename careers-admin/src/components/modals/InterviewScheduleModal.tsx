import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { api } from '../../utils/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';


interface User {
  id: string;
  name: string;
  email: string;
}

interface Office {
  _id: string;
  name: string;
  address: string;
  companyId: string;
}

interface Interviewer {
  userId: string;
  name: string;
}

interface InterviewData {
  id?: string;
  title: string;
  description?: string;
  scheduledDate: Date | string;
  location?: string;
  onlineMeetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  interviewers: Interviewer[];
}

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  candidateName?: string;
  candidateEmail?: string;
  onScheduled?: (interviewId: string) => void;
  processId?: string;
  // Edit mode props
  mode?: 'create' | 'edit';
  existingInterview?: InterviewData;
  onSave?: (updatedInterview: Partial<InterviewData>) => void;
  isLoading?: boolean; // For edit mode loading state
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  candidateEmail,
  onScheduled,
  processId,
  mode = 'create',
  existingInterview,
  onSave,
  isLoading = false,
}) => {
  const isEditMode = mode === 'edit';
  
  const [title, setTitle] = useState<string>(
    existingInterview?.title || (candidateName ? `Interview with ${candidateName}` : '')
  );
  const [description, setDescription] = useState<string>(existingInterview?.description || '');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [location, setLocation] = useState<string>(existingInterview?.location || '');
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState<string>(existingInterview?.onlineMeetingUrl || '');
  const [meetingId, setMeetingId] = useState<string>(existingInterview?.meetingId || '');
  const [meetingPassword, setMeetingPassword] = useState<string>(existingInterview?.meetingPassword || '');
  const [users, setUsers] = useState<User[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [useGoogleWorkspace, setUseGoogleWorkspace] = useState<boolean>(false);
  const [hasGoogleCalendar, setHasGoogleCalendar] = useState<boolean>(false);
  const [googleAuthExpired, setGoogleAuthExpired] = useState<boolean>(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [interviewDuration, setInterviewDuration] = useState<number>(60); // Default 60 minutes

  // Fetch company users, offices, and check Google Workspace
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await api.get<User[]>('/users');
        setUsers(usersData);

        // Check if company uses Google Workspace
        const companyData = await api.get<any>('/company');
        const usesGoogle = companyData.settings?.emailCalendarProvider === 'google';
        setUseGoogleWorkspace(usesGoogle);

        // Check if user has connected Google Calendar
        const userData = await api.get<any>('/users/me');
        setHasGoogleCalendar(userData.user?.hasGoogleCalendar || false);
        setGoogleAuthExpired(userData.user?.googleAuthExpired || false);

        // Fetch company offices
        const officesData = await api.get<Office[]>('/company/offices');
        setOffices(officesData);

        // Fetch applicant's available time slots if in create mode
        if (!isEditMode && applicationId) {
          try {
            const applicantData = await api.get<any>(`/job-applications/${applicationId}`);
            setAvailableTimeSlots(applicantData.availableTimeSlots || []);
          } catch (err) {
            console.error('Error fetching applicant timeslots:', err);
            // Non-critical error, continue without timeslots
          }
        }

        // Fetch interview process to get stage duration if processId is provided
        if (!isEditMode && processId) {
          try {
            const processData = await api.get<any>(`/interview-processes/${processId}`);
            // Get the first stage's duration as default (or could be passed as prop)
            if (processData.stages && processData.stages.length > 0) {
              setInterviewDuration(processData.stages[0].durationMinutes || 60);
            }
          } catch (err) {
            console.error('Error fetching interview process:', err);
            // Non-critical error, use default duration
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load company data');
      }
    };

    if (isOpen) {
      fetchData();
      
      // Check if we just returned from OAuth
      const params = new URLSearchParams(window.location.search);
      if (params.get('googleCalendarConnected') === 'true') {
        // Refetch user data to update hasGoogleCalendar flag
        setTimeout(() => fetchData(), 500);
      }
      
      // Set date and time from existing interview or defaults
      if (existingInterview?.scheduledDate) {
        const schedDate = new Date(existingInterview.scheduledDate);
        setDate(schedDate.toISOString().split('T')[0]);
        setTime(schedDate.toTimeString().slice(0, 5));
      } else {
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
        
        // Set default time to 10:00 AM
        setTime('10:00');
      }
      
      // Set selected users from existing interview
      if (existingInterview?.interviewers) {
        const interviewerUsers = existingInterview.interviewers.map(i => ({
          id: i.userId,
          name: i.name,
          email: '', // Email not needed for display
        }));
        setSelectedUsers(interviewerUsers);
      }
    }
  }, [isOpen, existingInterview, applicationId, isEditMode, processId]);

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
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
    
    if (!isEditMode) {
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
    }
    
    // Validate meeting URL if provided
    if (onlineMeetingUrl && !isValidUrl(onlineMeetingUrl)) {
      setError('Please enter a valid meeting URL');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isEditMode && onSave) {
        // Edit mode - just save the updated fields
        onSave({
          title,
          description,
          location,
          onlineMeetingUrl,
          meetingId,
          meetingPassword,
        });
        onClose();
      } else {
        // Create mode - schedule new interview
        const scheduledDate = new Date(`${date}T${time}`);
        
        const interviewersList = selectedUsers.map(user => ({
          userId: user.id,
          name: user.name,
        }));
        
        interface InterviewResponse {
          id: string;
          [key: string]: any;
        }
        
        const response = await api.post<InterviewResponse>(`/job-applications/${applicationId}/interviews`, {
          scheduledDate,
          title,
          description,
          interviewers: interviewersList,
          processId,
          stage: 'Technical Interview', // Default stage
          location,
          onlineMeetingUrl,
          meetingId,
          meetingPassword,
        });
        
        const interviewId = response.id;
        
        if (onScheduled) {
          onScheduled(interviewId);
        }
        onClose();
      }
    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'scheduling'} interview:`, err);
      
      // Check if Google auth expired
      if (err.message?.includes('GOOGLE_AUTH_EXPIRED')) {
        setError('Your Google Calendar connection has expired. Please reconnect your Google account below and try again.');
        // Refresh user data to update hasGoogleCalendar flag
        const userData = await api.get<any>('/users/me');
        setHasGoogleCalendar(userData.user?.hasGoogleCalendar || false);
      } else {
        setError(`Failed to ${isEditMode ? 'update' : 'schedule'} interview. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isLoading;

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isBusy && onClose()}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit Interview Details' : 'Schedule Interview'}
            </h2>
            <button
              onClick={() => !isBusy && onClose()}
              className="text-gray-400 hover:text-gray-500"
              disabled={isBusy}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {!isEditMode && availableTimeSlots.length === 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm font-medium">⚠️ No available time slots</p>
              <p className="text-xs mt-1">The applicant has not provided their availability yet. You can schedule the interview at any time, but please coordinate with the candidate separately.</p>
            </div>
          )}
          
          {!isEditMode && availableTimeSlots.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              <p className="text-sm font-medium">✓ Applicant has {availableTimeSlots.length} available time slot{availableTimeSlots.length !== 1 ? 's' : ''}</p>
              <p className="text-xs mt-1">Interview duration: {interviewDuration} minutes. Please select a time that fits within their availability.</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Interview Title *
              </label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {!isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isSubmitting}
                      required
                      onClick={(e) => {
                        const input = e.currentTarget as HTMLInputElement;
                        if ('showPicker' in input) {
                          (input as any).showPicker();
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <Input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            )}
        
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
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a location</option>
                <option value="Remote">Remote</option>
                {offices.map((office) => (
                  <option key={office._id} value={office.name}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>
            
            {useGoogleWorkspace ? (
              <div className="border-t border-gray-200 pt-4 mt-4">
                {hasGoogleCalendar && !googleAuthExpired ? (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                    <p className="text-sm font-medium">✓ Google Meet will be automatically created</p>
                    <p className="text-xs mt-1">A Google Meet link will be generated and shared with all participants when you schedule this interview.</p>
                  </div>
                ) : googleAuthExpired ? (
                  <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md">
                    <p className="text-sm font-medium">⚠️ Google Calendar connection expired</p>
                    <p className="text-xs mt-1 mb-2">Your Google Calendar access has expired. Please sign in again to create Google Meet links.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                        // Store current URL to return to after OAuth
                        sessionStorage.setItem('oauthReturnUrl', window.location.pathname);
                        window.location.href = `${backendUrl}/auth/google?calendar=true`;
                      }}
                      className="mt-2 px-4 py-2 bg-white border border-orange-300 rounded-md text-sm font-medium text-orange-900 hover:bg-orange-50"
                    >
                      Reconnect Google Calendar
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                    <p className="text-sm font-medium">Connect Google Calendar to create Google Meet links</p>
                    <p className="text-xs mt-1 mb-2">Sign in with your Google account to automatically create Google Meet links for interviews.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                        // Store current URL to return to after OAuth
                        sessionStorage.setItem('oauthReturnUrl', window.location.pathname);
                        window.location.href = `${backendUrl}/auth/google?calendar=true`;
                      }}
                      className="mt-2 px-4 py-2 bg-white border border-yellow-300 rounded-md text-sm font-medium text-yellow-900 hover:bg-yellow-50"
                    >
                      Sign in with Google
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-medium mb-3">Meeting Details</h3>
                
                <div>
                  <label htmlFor="onlineMeetingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting URL
                  </label>
                  <Input
                    type="url"
                    id="onlineMeetingUrl"
                    value={onlineMeetingUrl}
                    onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="https://zoom.us/j/123456789"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting ID (optional)
                    </label>
                    <Input
                      type="text"
                      id="meetingId"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="123 456 7890"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="meetingPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password (optional)
                    </label>
                    <Input
                      type="text"
                      id="meetingPassword"
                      value={meetingPassword}
                      onChange={(e) => setMeetingPassword(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="123456"
                    />
                  </div>
                </div>
              </div>
            )}
        
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interviewers * (max 10)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
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
                
                {candidateEmail && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Note:</span> The candidate's email ({candidateEmail}) will be included in the calendar invite.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" onClick={() => !isBusy && onClose()} variant="white" disabled={isBusy}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} variant="primary" disabled={isBusy}>
              {isBusy ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Saving...' : 'Scheduling...'}
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Schedule Interview'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default InterviewScheduleModal;
