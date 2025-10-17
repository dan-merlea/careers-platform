import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Input from '../common/Input';
import Button from '../common/Button';
import jobBoardsService, { JobBoard } from '../../services/jobBoardsService';

interface JobBoardModalProps {
  isOpen: boolean;
  companyName: string
  jobBoard: JobBoard | null;
  onClose: () => void;
}

const JobBoardModal: React.FC<JobBoardModalProps> = ({
  isOpen,
  companyName,
  jobBoard,
  onClose,
}) => {

  const [formData, setFormData] = useState({
    title: jobBoard?.title || '',
    description: jobBoard?.description || '',
    slug: jobBoard?.slug || '',
    customDomain: jobBoard?.customDomain || '',
    isActive: jobBoard?.isActive || true
  });
  const [error, setError] = useState<string | null>(null);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; message: string; cname?: string } | null>(null);

  // Generate slug from company name
  useEffect(() => {
    const generatedSlug = companyName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData({
      title: jobBoard?.title || '',
      description: jobBoard?.description || '',
      slug: jobBoard?.slug || generatedSlug,
      customDomain: jobBoard?.customDomain || '',
      isActive: jobBoard?.isActive || true
    })
  }, [companyName, jobBoard]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Strip URL to host for custom domain
    let processedValue = value;
    if (name === 'customDomain' && value) {
      try {
        // Remove protocol and trailing slashes
        processedValue = value
          .replace(/^https?:\/\//, '')
          .replace(/\/+$/, '')
          .trim();
      } catch {
        processedValue = value;
      }
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle verify custom domain
  const handleVerifyDomain = async () => {
    if (!jobBoard) return;

    setVerifyingDomain(true);
    try {
      const result = await jobBoardsService.verifyCustomDomain(jobBoard._id);
      setVerificationResult(result);
    } catch {
      setVerificationResult({
        verified: false,
        message: 'Failed to verify domain. Please try again.',
      });
    } finally {
      setVerifyingDomain(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (jobBoard) {
        // Update existing job board
        await jobBoardsService.updateJobBoard(jobBoard._id, formData);
      } else {
        // Create new job board
        await jobBoardsService.createJobBoard(formData);
      }

      onClose();
    } catch (err) {
      console.error('Error saving job board:', err);
      setError('Failed to save job board. Please try again.');
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {jobBoard ? 'Edit Job Board' : 'Create Job Board'}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <Input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="e.g., my-company-jobs"
            />
            <p className="mt-2 text-sm text-gray-500">
              The slug will be used to create a public link for this job board:
            </p>
            <p className="mt-1 text-sm text-blue-600 font-medium">
              https://hatchbeacon.com/job-board/{formData.slug || 'your-slug'}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">
                Custom Domain
              </label>
              <a
                href={`${process.env.REACT_APP_WEB_URL || 'http://localhost:3002'}/docs/custom-domain-setup`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Setup Guide
              </a>
            </div>
            <Input
              type="text"
              id="customDomain"
              name="customDomain"
              value={formData.customDomain}
              onChange={handleInputChange}
              placeholder="e.g., careers.yourcompany.com"
              disabled={!formData.slug && !jobBoard?.slug}
            />
            <p className="mt-1 text-xs text-gray-500">
              Recommended: Use a subdomain (e.g., careers.yourcompany.com)
            </p>
            {!formData.slug && !jobBoard?.slug && (
              <p className="mt-1 text-xs text-amber-600">
                Please set a slug before configuring a custom domain
              </p>
            )}

            {jobBoard && formData.customDomain && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={handleVerifyDomain}
                  variant="white"
                  disabled={verifyingDomain}
                  className="text-sm"
                >
                  {verifyingDomain ? 'Verifying...' : 'Verify Domain'}
                </Button>

                {verificationResult && (
                  <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${verificationResult.verified
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-amber-50 border border-amber-200'
                    }`}>
                    {verificationResult.verified ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ExclamationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${verificationResult.verified ? 'text-green-800' : 'text-amber-800'
                        }`}>
                        {verificationResult.message}
                      </p>
                      {verificationResult.cname && (
                        <p className="text-xs text-gray-600 mt-1">
                          Expected CNAME: <code className="bg-white px-1 py-0.5 rounded">{verificationResult.cname}</code>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={onClose} variant="white">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {jobBoard ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobBoardModal;
