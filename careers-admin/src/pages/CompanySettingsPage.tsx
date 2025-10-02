import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CompanySettings, companyService } from '../services/company.service';
import { useCompany } from '../context/CompanyContext';
import Select from '../components/common/Select';

const CompanySettingsPage: React.FC = () => {
  const { company, loading: companyLoading } = useCompany();
  const [settings, setSettings] = useState<CompanySettings>({
    approvalType: 'headcount',
    emailCalendarProvider: 'other'
  });
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Use company data from context
  useEffect(() => {
    if (company && company.settings) {
      console.log('Loading company settings:', company.settings);
      setSettings({
        approvalType: company.settings.approvalType || 'headcount',
        emailCalendarProvider: company.settings.emailCalendarProvider || 'other'
      });
      // allowedDomains may be top-level or under settings depending on backend response
      const domains = (company.allowedDomains || (company.settings as any)?.allowedDomains || []) as string[];
      setAllowedDomains(domains);
    }
  }, [company]);

  const handleApprovalTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      approvalType: event.target.value as 'headcount' | 'job-opening',
    });
  };

  // Provider change handled via Select onChange above

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving settings:', settings);
      
      // Use the direct API endpoint for settings
      await companyService.saveCompanySettings({ ...settings, allowedDomains });
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

  const isValidDomain = (value: string) => {
    // Simple domain validation: must contain a dot and no spaces
    const v = value.trim().toLowerCase();
    return v.length > 0 && v.includes('.') && !v.includes(' ');
  };

  const handleAddDomain = () => {
    const v = newDomain.trim().toLowerCase();
    if (!isValidDomain(v)) {
      toast.error('Please enter a valid domain (e.g., acme.com)');
      return;
    }
    if (allowedDomains.includes(v)) {
      toast.info('Domain already added');
      return;
    }
    setAllowedDomains((prev) => [...prev, v]);
    setNewDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    setAllowedDomains((prev) => prev.filter((d) => d !== domain));
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
              <Select
                value={settings.emailCalendarProvider || 'other'}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    emailCalendarProvider: (val as 'google' | 'microsoft' | 'other') || 'other',
                  })
                }
                className="w-full"
                options={[
                  { label: 'Google Workspace', value: 'google' },
                  { label: 'Microsoft 365', value: 'microsoft' },
                  { label: 'Other', value: 'other' },
                ]}
              />
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Allowed Email Domains for SSO</h2>
          <p className="text-gray-500 mb-4">Employees using these domains can request access via IT if they do not already have an account.</p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g., acme.com"
              className="flex-1 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={handleAddDomain}
              className="px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm"
            >
              Add
            </button>
          </div>

          {allowedDomains.length === 0 ? (
            <p className="text-sm text-gray-500">No domains added yet.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {allowedDomains.map((domain) => (
                <li key={domain} className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm">
                  <span>{domain}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDomain(domain)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Remove ${domain}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
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
