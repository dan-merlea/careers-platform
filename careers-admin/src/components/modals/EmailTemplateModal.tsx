import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/QuillEditor.css';
import '../../styles/EmailEditor.css';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailContent: string) => void;
  onSkip: () => void;
  stage: {
    id: string;
    title: string;
    emailTemplate?: string;
  };
  applicantName: string;
  jobTitle?: string;
  applicationId?: string;
  interviewId?: string;
}

const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  onClose,
  onSend,
  onSkip,
  stage,
  applicantName,
  jobTitle = 'the position',
  applicationId,
  interviewId,
}) => {
  const [emailContent, setEmailContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [includeTimeslotLink, setIncludeTimeslotLink] = useState(false);

  // Generate email template based on stage
  useEffect(() => {
    console.log(stage);
    if (isOpen) {
      setEmailContent(stage.emailTemplate ?? '');
      setIncludeTimeslotLink(false); // Reset checkbox when modal opens
    }
  }, [isOpen, stage, applicantName, jobTitle]);

  // Update email content when checkbox changes
  useEffect(() => {
    if (!isOpen) return;
    
    const baseContent = stage.emailTemplate ?? '';
    
    if (includeTimeslotLink && applicationId) {
      const webUrl = process.env.REACT_APP_WEB_URL || 'http://localhost:3002';
      const timeslotLink = interviewId 
        ? `${webUrl}/timeslots/${applicationId}/interview/${interviewId}`
        : `${webUrl}/timeslots/${applicationId}`;
      const linkHtml = `\n\n<p><strong>Please select your available time slots:</strong></p><p><a href="${timeslotLink}" target="_blank">${timeslotLink}</a></p>`;
      setEmailContent(baseContent + linkHtml);
    } else {
      setEmailContent(baseContent);
    }
  }, [includeTimeslotLink, applicationId, interviewId, isOpen, stage.emailTemplate]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      // For now, just log the email content
      console.log('Sending email:', emailContent);
      
      // Call the onSend callback (email content already includes link if checkbox was checked)
      onSend(emailContent);
    } finally {
      setIsSending(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Email Template: {stage.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-grow overflow-auto">
          <div className="mb-4">
            <label htmlFor="emailContent" className="block text-sm font-medium text-gray-700 mb-2">
              Email Content
            </label>
            <ReactQuill
              theme="snow"
              value={emailContent}
              onChange={setEmailContent}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'color': []}, {'background': []}],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link'],
                  ['clean']
                ]
              }}
              className="bg-white mb-4 quill-editor email-editor"
              style={{ height: '300px' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeTimeslotLink"
              checked={includeTimeslotLink}
              onChange={(e) => setIncludeTimeslotLink(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeTimeslotLink" className="ml-2 block text-sm text-gray-700">
              Include time slot asking link
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Skip Email
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send Email & Update Stage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateModal;
