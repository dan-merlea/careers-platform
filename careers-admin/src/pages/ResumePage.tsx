import React, { useState, useEffect } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import jobApplicationService from '../services/jobApplicationService';

interface ResumePageProps {
  id: string;
}

const ResumePage: React.FC<ResumePageProps> = ({ id }) => {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeMimeType, setResumeMimeType] = useState<string>('');
  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResumeContent = async () => {
      try {
        setIsLoadingResume(true);
        const { url, mimeType } = await jobApplicationService.getResumeContentUrl(id);
        setResumeUrl(url);
        setResumeMimeType(mimeType);
      } catch (err) {
        console.error('Error loading resume content:', err);
        setError('Failed to load resume content. Please try again.');
      } finally {
        setIsLoadingResume(false);
      }
    };

    loadResumeContent();
  }, [id]);

  const handleDownloadResume = async () => {
    if (!id) return;
    
    try {
      await jobApplicationService.downloadResume(id);
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError('Failed to download resume. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
            Resume
          </h2>
          <button 
            onClick={handleDownloadResume}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            Download Resume
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg">
          {isLoadingResume ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : resumeUrl ? (
            <div className="h-96 overflow-hidden">
              {resumeMimeType.includes('pdf') ? (
                <iframe 
                  src={resumeUrl} 
                  className="w-full h-full" 
                  title="Resume Preview"
                />
              ) : resumeMimeType.includes('image') ? (
                <img 
                  src={resumeUrl} 
                  alt="Resume" 
                  className="max-w-full max-h-full mx-auto"
                />
              ) : (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-4">Resume is available but cannot be previewed in browser</p>
                  <button 
                    onClick={handleDownloadResume}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Download Resume
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-2" />
              <p className="text-gray-600">No resume available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
