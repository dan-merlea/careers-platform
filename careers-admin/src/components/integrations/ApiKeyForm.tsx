import React, { useState } from 'react';
import Button from '../common/Button';
import { IntegrationType } from '../../services/apiKeys.service';

interface ApiKeyFormProps {
  type: IntegrationType;
  title: string;
  description: string;
  onSave: (data: {
    type: IntegrationType;
    apiKey: string;
    apiSecret?: string;
    baseUrl?: string;
    companyId?: string;
  }) => Promise<void>;
  initialValues?: {
    apiKey: string;
    apiSecret?: string;
    baseUrl?: string;
    companyId?: string;
  };
  isLoading?: boolean;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({
  type,
  title,
  description,
  onSave,
  initialValues,
  isLoading = false,
}) => {
  const [apiKey, setApiKey] = useState(initialValues?.apiKey || '');
  const [apiSecret, setApiSecret] = useState(initialValues?.apiSecret || '');
  const [baseUrl, setBaseUrl] = useState(initialValues?.baseUrl || '');
  const [companyId, setCompanyId] = useState(initialValues?.companyId || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await onSave({
        type,
        apiKey,
        apiSecret: apiSecret || undefined,
        baseUrl: baseUrl || undefined,
        companyId: companyId || undefined,
      });
      setSuccess('API key saved successfully');
    } catch (err) {
      setError('Failed to save API key. Please try again.');
      console.error('Error saving API key:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-md font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
            <span className="ml-1 text-xs text-gray-500">(Required)</span>
          </label>
          <div className="mb-1 text-xs text-gray-500">
            {type === IntegrationType.GREENHOUSE ? 
              'Your Greenhouse API key for authentication' : 
              'Your Ashby API key with candidatesWrite permission'}
          </div>
          <div className="flex">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={type === IntegrationType.GREENHOUSE ? 
                "Enter Greenhouse API key" : 
                "Enter Ashby API key"}
              required
              disabled={isLoading || isSaving}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200"
              disabled={isLoading || isSaving}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Secret
            <span className="ml-1 text-xs text-gray-500">(Optional)</span>
          </label>
          <div className="mb-1 text-xs text-gray-500">
            {type === IntegrationType.GREENHOUSE ? 
              'Additional authentication secret if required by your Greenhouse setup' : 
              'Additional authentication secret if required by your Ashby setup'}
          </div>
          <div className="flex">
            <input
              type={showApiSecret ? 'text' : 'password'}
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter API secret (if required)"
              disabled={isLoading || isSaving}
            />
            <button
              type="button"
              onClick={() => setShowApiSecret(!showApiSecret)}
              className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200"
              disabled={isLoading || isSaving}
            >
              {showApiSecret ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base URL
            <span className="ml-1 text-xs text-gray-500">(Optional)</span>
          </label>
          <div className="mb-1 text-xs text-gray-500">
            {type === IntegrationType.GREENHOUSE ? 
              'Default: https://boards-api.greenhouse.io/v1/boards/' : 
              'Default: https://api.ashbyhq.com/posting-api/job-board/'}
          </div>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={type === IntegrationType.GREENHOUSE ? 
              "https://boards-api.greenhouse.io/v1/boards/" : 
              "https://api.ashbyhq.com/posting-api/job-board/"}
            disabled={isLoading || isSaving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company ID / Board ID
            <span className="ml-1 text-xs text-gray-500">(Required)</span>
          </label>
          <div className="mb-1 text-xs text-gray-500">
            {type === IntegrationType.GREENHOUSE ? 
              'Your Greenhouse board ID found in the URL: https://boards-api.greenhouse.io/v1/boards/{board-id}/jobs' : 
              'Your Ashby company name found in the URL: https://jobs.ashbyhq.com/{company-id}'}
          </div>
          <input
            type="text"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={type === IntegrationType.GREENHOUSE ? 
              "e.g., acme" : 
              "e.g., Ashby"}
            disabled={isLoading || isSaving}
            required
          />
          <div className="mt-1 text-xs text-gray-500">
            {type === IntegrationType.GREENHOUSE ? 
              'Example: If your job board URL is https://boards.greenhouse.io/acme, enter "acme"' : 
              'Example: If your job board URL is https://jobs.ashbyhq.com/Ashby, enter "Ashby"'}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || isSaving} variant="primary">
            {isSaving ? 'Saving...' : 'Save API Key'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyForm;
