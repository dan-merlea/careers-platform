import React, { useState, useEffect } from 'react';
import ApiKeyForm from '../components/integrations/ApiKeyForm';
import { apiKeysService, IntegrationType, ApiKey, CreateApiKeyDto } from '../services/apiKeys.service';

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
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Configuration Settings</h2>
          <p className="text-gray-600 mb-6">
            Configure your system settings and preferences for the careers platform.
          </p>
          
          <div className="space-y-6">
            {/* ATS Integrations Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">ATS Integrations</h3>
              
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
