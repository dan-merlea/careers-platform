import React, { useState } from 'react';
import { toast } from 'react-toastify';

export enum CalendarIntegrationType {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

export interface CalendarCredentials {
  type: CalendarIntegrationType;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  refreshToken?: string;
  tenantId?: string;
}

interface CalendarIntegrationFormProps {
  type: CalendarIntegrationType;
  title: string;
  description: string;
  onSave: (data: CalendarCredentials) => Promise<void>;
  initialValues?: CalendarCredentials;
  isLoading?: boolean;
}

const CalendarIntegrationForm: React.FC<CalendarIntegrationFormProps> = ({
  type,
  title,
  description,
  onSave,
  initialValues,
  isLoading = false,
}) => {
  const [credentials, setCredentials] = useState<CalendarCredentials>(
    initialValues || {
      type,
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      refreshToken: '',
      tenantId: '',
    }
  );
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave(credentials);
      toast.success(`${title} credentials saved successfully`);
    } catch (error) {
      console.error(`Error saving ${title} credentials:`, error);
      toast.error(`Failed to save ${title} credentials`);
    } finally {
      setSaving(false);
    }
  };

  const isGoogleCalendar = type === CalendarIntegrationType.GOOGLE;
  const isMicrosoftCalendar = type === CalendarIntegrationType.MICROSOFT;

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`${type}-client-id`} className="block text-sm font-medium text-gray-700 mb-1">
            Client ID
          </label>
          <input
            id={`${type}-client-id`}
            name="clientId"
            type="text"
            value={credentials.clientId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter client ID"
            required
          />
        </div>

        <div>
          <label htmlFor={`${type}-client-secret`} className="block text-sm font-medium text-gray-700 mb-1">
            Client Secret
          </label>
          <div className="relative">
            <input
              id={`${type}-client-secret`}
              name="clientSecret"
              type={showSecret ? 'text' : 'password'}
              value={credentials.clientSecret}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter client secret"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {isGoogleCalendar && (
          <>
            <div>
              <label htmlFor={`${type}-redirect-uri`} className="block text-sm font-medium text-gray-700 mb-1">
                Redirect URI
              </label>
              <input
                id={`${type}-redirect-uri`}
                name="redirectUri"
                type="text"
                value={credentials.redirectUri || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter redirect URI"
                required
              />
            </div>

            <div>
              <label htmlFor={`${type}-refresh-token`} className="block text-sm font-medium text-gray-700 mb-1">
                Refresh Token
              </label>
              <div className="relative">
                <input
                  id={`${type}-refresh-token`}
                  name="refreshToken"
                  type={showSecret ? 'text' : 'password'}
                  value={credentials.refreshToken || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter refresh token"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                <a 
                  href="https://developers.google.com/identity/protocols/oauth2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Learn how to get a refresh token
                </a>
              </p>
            </div>
          </>
        )}

        {isMicrosoftCalendar && (
          <div>
            <label htmlFor={`${type}-tenant-id`} className="block text-sm font-medium text-gray-700 mb-1">
              Tenant ID
            </label>
            <input
              id={`${type}-tenant-id`}
              name="tenantId"
              type="text"
              value={credentials.tenantId || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter tenant ID"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              <a 
                href="https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Learn how to register an app in Azure
              </a>
            </p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className={`px-4 py-2 rounded-md text-white font-medium ${
              saving || isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={saving || isLoading}
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Credentials'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CalendarIntegrationForm;
