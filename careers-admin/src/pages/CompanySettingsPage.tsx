import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CompanySettings, companyService } from '../services/company.service';
import { useCompany } from '../context/CompanyContext';

const CompanySettingsPage: React.FC = () => {
  const { company, loading: companyLoading, updateCompany } = useCompany();
  const [settings, setSettings] = useState<CompanySettings>({
    approvalType: 'headcount',
    emailCalendarProvider: 'other'
  });
  const [saving, setSaving] = useState<boolean>(false);

  // Use company data from context
  useEffect(() => {
    if (company && company.settings) {
      console.log('Loading company settings:', company.settings);
      setSettings({
        approvalType: company.settings.approvalType || 'headcount',
        emailCalendarProvider: company.settings.emailCalendarProvider || 'other'
      });
    }
  }, [company]);

  const handleApprovalTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      approvalType: event.target.value as 'headcount' | 'job-opening',
    });
  };

  const handleProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Provider changed to:', event.target.value);
    setSettings({
      ...settings,
      emailCalendarProvider: event.target.value as 'google' | 'microsoft' | 'other',
    });
    console.log('Updated settings:', { ...settings, emailCalendarProvider: event.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving settings:', settings);
      
      // Use the direct API endpoint for settings
      await companyService.saveCompanySettings(settings);
      toast.success('Settings saved successfully');
      
      // Refresh company data
      if (company) {
        const updatedCompany = await companyService.getCompanyDetails();
        console.log('Updated company after save:', updatedCompany);
      }
    } catch (error) {
      console.error('Error saving company settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (companyLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Company Settings</h1>
        <p className="text-gray-600 mb-6">Configure your company's approval workflow settings</p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Approval Workflow</h2>
          <p className="text-gray-500 mb-4">Choose which type of approval workflow your company will use</p>

          <div className="space-y-6 mb-6">
            <div className="flex items-start">
              <input
                type="radio"
                id="headcount"
                name="approvalType"
                value="headcount"
                checked={settings.approvalType === 'headcount'}
                onChange={handleApprovalTypeChange}
                className="mt-1 mr-3"
              />
              <div>
                <label htmlFor="headcount" className="font-medium cursor-pointer">
                  Approving Headcount <span className="text-gray-500">(Default)</span>
                </label>
                <p className="text-gray-500 mt-1">
                  Managers request headcount approval before recruiters create job openings.
                </p>
                <p className="text-gray-500 mt-1">
                  This is a two-step process: 1) Approve headcount 2) Create job opening
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="radio"
                id="job-opening"
                name="approvalType"
                value="job-opening"
                checked={settings.approvalType === 'job-opening'}
                onChange={handleApprovalTypeChange}
                className="mt-1 mr-3"
              />
              <div>
                <label htmlFor="job-opening" className="font-medium cursor-pointer">
                  Approving Job Openings <span className="text-gray-500">(Simplified)</span>
                </label>
                <p className="text-gray-500 mt-1">
                  Recruiters create job openings directly, which are then approved or rejected.
                </p>
                <p className="text-gray-500 mt-1">
                  This is a single-step process: Create and approve job openings in one workflow
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Email & Calendar Provider</h2>
          <p className="text-gray-500 mb-4">Select the email and calendar provider your company uses</p>

          <div className="mb-4">
            <label htmlFor="emailCalendarProvider" className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <div className="relative rounded-md shadow-sm">
              <select
                id="emailCalendarProvider"
                name="emailCalendarProvider"
                value={settings.emailCalendarProvider || 'other'}
                onChange={handleProviderChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none"
              >
                <option value="google">Google Workspace</option>
                <option value="microsoft">Microsoft 365</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {settings.emailCalendarProvider === 'google' && (
                "This setting optimizes calendar invites and integrations for Google Workspace."
              )}
              {settings.emailCalendarProvider === 'microsoft' && (
                "This setting optimizes calendar invites and integrations for Microsoft 365."
              )}
              {settings.emailCalendarProvider === 'other' && (
                "Select this if you use another email and calendar provider."
              )}
            </p>
            <p className="mt-2 text-sm text-blue-600">
              <a href="/setup" className="flex items-center hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configure API credentials for {settings.emailCalendarProvider} integration
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white font-medium ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsPage;
