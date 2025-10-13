import React, { useState, useEffect } from 'react';
import ApiKeyForm from '../../components/integrations/ApiKeyForm';
import CompanyApiKeysSection from '../../components/setup/CompanyApiKeysSection';
import { apiKeysService, IntegrationType, ApiKey, CreateApiKeyDto } from '../../services/apiKeys.service';
import Card from '../../components/common/Card';

const SetupPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadApiKeys();
  }, []);
  
  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await apiKeysService.getAll();
      setApiKeys(keys);
      setError(null);
    } catch (err) {
      console.error('Error loading API keys:', err);
      setError('Failed to load API keys. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleSaveApiKey = async (data: CreateApiKeyDto) => {
    try {
      const savedKey = await apiKeysService.saveApiKey(data);
      
      // Update the local state with the new/updated key
      setApiKeys(prev => {
        const exists = prev.some(key => key.type === data.type);
        if (exists) {
          return prev.map(key => key.type === data.type ? savedKey : key);
        } else {
          return [...prev, savedKey];
        }
      });
      
      // Automatically create job board for the integration
      try {
        const source = data.type === IntegrationType.GREENHOUSE ? 'greenhouse' : 'ashby';
        const { default: jobBoardsService } = await import('../../services/jobBoardsService');
        await jobBoardsService.createExternalJobBoard(source);
      } catch (jobBoardErr) {
        console.error('Error creating job board:', jobBoardErr);
        // Don't fail the API key save if job board creation fails
      }
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error saving API key:', err);
      return Promise.reject(err);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">System Setup</h1>
      </div>
      
      <p className="text-gray-600">
        Configure your system settings and preferences for the careers platform.
      </p>
      
      {/* ATS Integrations Section */}
      <Card>
        <h3 className="text-lg font-medium text-gray-800 mb-2">ATS Integrations</h3>
        <p className="text-gray-600 mb-6">Connect to your Applicant Tracking System to sync job postings and applications.</p>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="py-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">Loading integrations...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Greenhouse Integration */}
            <ApiKeyForm
              type={IntegrationType.GREENHOUSE}
              title="Greenhouse Integration"
              description="Connect to Greenhouse ATS to sync job postings and applications. The Company ID is your Greenhouse board ID (e.g., 'companyname' from https://boards-api.greenhouse.io/v1/boards/companyname/jobs) and is required to import jobs and submit applications."
              onSave={handleSaveApiKey}
              initialValues={apiKeys?.find(key => key.type === IntegrationType.GREENHOUSE)}
              isLoading={loading}
            />
            
            {/* Ashby Integration */}
            <ApiKeyForm
              type={IntegrationType.ASHBY}
              title="Ashby Integration"
              description="Connect to Ashby ATS to sync job postings and applications. The Company ID is your Ashby company identifier and is required to import jobs and submit applications to your Ashby instance."
              onSave={handleSaveApiKey}
              initialValues={apiKeys?.find(key => key.type === IntegrationType.ASHBY)}
              isLoading={loading}
            />
          </div>
        )}
      </Card>
      
      {/* Company API Keys Section */}
      <Card>
        <CompanyApiKeysSection />
      </Card>
    </div>
  );
};

export default SetupPage;
