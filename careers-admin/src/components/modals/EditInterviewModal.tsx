import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { Interview } from '../../services/interviewService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

interface EditInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview;
  onSave: (updatedInterview: Partial<Interview>) => void;
  isLoading: boolean;
}

const EditInterviewModal: React.FC<EditInterviewModalProps> = ({
  isOpen,
  onClose,
  interview,
  onSave,
  isLoading,
}) => {
  const [title, setTitle] = useState<string>(interview.title || '');
  const [description, setDescription] = useState<string>(interview.description || '');
  const [location, setLocation] = useState<string>(interview.location || '');
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState<string>(interview.onlineMeetingUrl || '');
  const [meetingId, setMeetingId] = useState<string>(interview.meetingId || '');
  const [meetingPassword, setMeetingPassword] = useState<string>(interview.meetingPassword || '');

  const handleSubmit = () => {
    onSave({
      title,
      description,
      location,
      onlineMeetingUrl,
      meetingId,
      meetingPassword,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isLoading && onClose()}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Interview Details
            </h2>
            <button
              onClick={() => !isLoading && onClose()}
              className="text-gray-400 hover:text-gray-500"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
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
                disabled={isLoading}
                required
              />
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
                disabled={isLoading}
                placeholder="Add interview details, agenda, or instructions..."
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
                placeholder="Office address or 'Remote'"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center mb-2">
                <VideoCameraIcon className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-md font-medium">Meeting Details</h3>
              </div>
              
              <div>
                <label htmlFor="onlineMeetingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting URL
                </label>
                <Input
                  type="url"
                  id="onlineMeetingUrl"
                  value={onlineMeetingUrl}
                  onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    placeholder="123456"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" onClick={() => !isLoading && onClose()} variant="white" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default EditInterviewModal;
