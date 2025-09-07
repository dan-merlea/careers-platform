import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CompanySettings } from '../services/company.service';
import { useCompany } from '../context/CompanyContext';

const CompanySettingsPage: React.FC = () => {
  const { company, loading: companyLoading, updateCompany } = useCompany();
  const [settings, setSettings] = useState<CompanySettings>({ approvalType: 'headcount' });
  const [saving, setSaving] = useState<boolean>(false);

  // Use company data from context
  useEffect(() => {
    if (company && company.settings) {
      setSettings(company.settings);
    }
  }, [company]);

  const handleApprovalTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      approvalType: event.target.value as 'headcount' | 'job-opening',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update company with new settings
      if (company) {
        const updatedCompany = { ...company, settings };
        await updateCompany(updatedCompany);
        toast.success('Settings saved successfully');
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
                  Managers request headcount approval before recruitors create job openings.
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
                  Recruitors create job openings directly, which are then approved or rejected.
                </p>
                <p className="text-gray-500 mt-1">
                  This is a single-step process: Create and approve job openings in one workflow
                </p>
              </div>
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
    </div>
  );
};

export default CompanySettingsPage;
