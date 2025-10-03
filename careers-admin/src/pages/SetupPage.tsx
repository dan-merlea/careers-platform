import React, { useState, useEffect } from 'react';
import ApiKeyForm from '../components/integrations/ApiKeyForm';
import CalendarIntegrationForm, { CalendarIntegrationType, CalendarCredentials } from '../components/integrations/CalendarIntegrationForm';
import { apiKeysService, IntegrationType, ApiKey, CreateApiKeyDto } from '../services/apiKeys.service';
import { calendarService } from '../services/calendar.service';
import { useCompany } from '../context/CompanyContext';
import Card from '../components/common/Card';

const SetupPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [calendarCredentials, setCalendarCredentials] = useState<CalendarCredentials[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const { company } = useCompany();
  
  useEffect(() => {
    loadApiKeys();
    loadCalendarCredentials();
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
  
  const loadCalendarCredentials = async () => {
    try {
      setCalendarLoading(true);
      const credentials = await calendarService.getCredentials();
      setCalendarCredentials(credentials);
      setCalendarError(null);
    } catch (err) {
      console.error('Error loading calendar credentials:', err);
      setCalendarError('Failed to load calendar credentials. Please refresh the page.');
    } finally {
      setCalendarLoading(false);
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
  
  const handleSaveCalendarCredentials = async (data: CalendarCredentials) => {
    try {
      const savedCredentials = await calendarService.saveCredentials(data);
      
      // Update the local state with the new/updated credentials
      setCalendarCredentials(prev => {
        const exists = prev.some(cred => cred.type === data.type);
        if (exists) {
          return prev.map(cred => cred.type === data.type ? savedCredentials : cred);
        } else {
          return [...prev, savedCredentials];
        }
      });
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error saving calendar credentials:', err);
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
      
      {/* Calendar Integrations Section */}
      <Card>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Calendar Integrations</h3>
        <p className="text-gray-600 mb-6">Connect to your calendar provider to create events and send invites.</p>
        
        {company?.settings?.emailCalendarProvider && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            <p className="font-medium">Current provider: {company.settings.emailCalendarProvider}</p>
            <p className="text-sm mt-1">You can change the provider in the <a href="/company-details" className="underline hover:text-blue-800">Company Settings</a> page.</p>
          </div>
        )}
        
        {calendarError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {calendarError}
          </div>
        )}
        
        {calendarLoading ? (
          <div className="py-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">Loading calendar integrations...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Google Calendar Integration */}
            <CalendarIntegrationForm
              type={CalendarIntegrationType.GOOGLE}
              title="Google Calendar Integration"
              description="Connect to Google Calendar API to create calendar events and send invites. You'll need to create OAuth 2.0 credentials in the Google Cloud Console."
              onSave={handleSaveCalendarCredentials}
              initialValues={calendarCredentials?.find(cred => cred.type === CalendarIntegrationType.GOOGLE)}
              isLoading={calendarLoading}
            />
            
            {/* Microsoft Calendar Integration */}
            <CalendarIntegrationForm
              type={CalendarIntegrationType.MICROSOFT}
              title="Microsoft 365 Calendar Integration"
              description="Connect to Microsoft Graph API to create calendar events and send invites. You'll need to register an application in the Azure portal."
              onSave={handleSaveCalendarCredentials}
              initialValues={calendarCredentials?.find(cred => cred.type === CalendarIntegrationType.MICROSOFT)}
              isLoading={calendarLoading}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default SetupPage;
