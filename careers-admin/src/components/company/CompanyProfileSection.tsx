import React from 'react';
import { CompanyDetails } from '../../services/company.service';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';

interface CompanyProfileSectionProps {
  companyDetails: CompanyDetails;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  valueInput: string;
  setValueInput: (value: string) => void;
  handleAddValue: () => void;
  handleRemoveValue: (index: number) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSocialLinkChange: (platform: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const CompanyProfileSection: React.FC<CompanyProfileSectionProps> = ({
  companyDetails,
  loading,
  saving,
  error,
  success,
  valueInput,
  setValueInput,
  handleAddValue,
  handleRemoveValue,
  handleInputChange,
  handleSocialLinkChange,
  handleSubmit,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
          </div>
          <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={companyDetails.name}
                onChange={handleInputChange as any}
                className="text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <Input
                type="url"
                id="website"
                name="website"
                value={companyDetails.website}
                onChange={handleInputChange as any}
                className="text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <Input
                type="text"
                id="industry"
                name="industry"
                value={companyDetails.industry}
                onChange={handleInputChange as any}
                className="text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-1">
                Founded Year
              </label>
              <Input
                type="text"
                id="foundedYear"
                name="foundedYear"
                value={companyDetails.foundedYear}
                onChange={handleInputChange as any}
                className="text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <Select
                value={companyDetails.size || undefined}
                onChange={(val) =>
                  handleInputChange({ target: { name: 'size', value: val || '' } } as any)
                }
                allowEmpty
                placeholder="Select size"
                className="w-full text-sm"
                options={[
                  { label: '1-10 employees', value: '1-10' },
                  { label: '11-50 employees', value: '11-50' },
                  { label: '51-200 employees', value: '51-200' },
                  { label: '201-500 employees', value: '201-500' },
                  { label: '501-1000 employees', value: '501-1000' },
                  { label: '1001-5000 employees', value: '1001-5000' },
                  { label: '5001+ employees', value: '5001+' },
                ]}
              />
            </div>
            
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <Input
                type="url"
                id="logo"
                name="logo"
                value={companyDetails.logo}
                onChange={handleInputChange as any}
                className="text-sm"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={companyDetails.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
          </div>
          <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                LinkedIn
              </label>
              <Input
                type="url"
                id="linkedin"
                value={companyDetails.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', (e.target as HTMLInputElement).value)}
              />
            </div>
            
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                Twitter
              </label>
              <Input
                type="url"
                id="twitter"
                value={companyDetails.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', (e.target as HTMLInputElement).value)}
              />
            </div>
            
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <Input
                type="url"
                id="facebook"
                value={companyDetails.socialLinks.facebook}
                onChange={(e) => handleSocialLinkChange('facebook', (e.target as HTMLInputElement).value)}
              />
            </div>
            
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <Input
                type="url"
                id="instagram"
                value={companyDetails.socialLinks.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', (e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Mission & Vision</h3>
          </div>
          <div className="py-3 grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="mission" className="block text-sm font-medium text-gray-700">
                Mission
              </label>
              <textarea
                id="mission"
                name="mission"
                rows={3}
                value={companyDetails.mission}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="vision" className="block text-sm font-medium text-gray-700">
                Vision
              </label>
              <textarea
                id="vision"
                name="vision"
                rows={3}
                value={companyDetails.vision}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Company Values</h3>
          </div>
          <div className="py-3">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput((e.target as HTMLInputElement).value)}
                  placeholder="Add a company value"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddValue} variant="secondary">
                  Add
                </Button>
              </div>
              
              <div className="space-y-2">
                {companyDetails.values.map((value, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span>
                      {typeof value === 'object' && value.icon && <i className={`bi bi-${value.icon} mr-2`}></i>}
                      {typeof value === 'object' ? value.text : String(value)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {companyDetails.values.length === 0 && (
                  <p className="text-gray-500 italic">No values added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfileSection;
