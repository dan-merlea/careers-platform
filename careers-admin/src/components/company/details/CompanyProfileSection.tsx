import React from 'react';
import { CompanyDetails } from '../../../services/company.service';
import IconDropdown from '../../shared/IconDropdown';
import Select from '../../common/Select';

interface CompanyProfileSectionProps {
  companyDetails: CompanyDetails;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSocialLinkChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loadCompanyDetails: () => void;
  valueInput: string;
  setValueInput: (value: string) => void;
  valueIcon: string;
  setValueIcon: (icon: string) => void;
  handleAddValue: () => void;
  handleRemoveValue: (index: number) => void;
}

const CompanyProfileSection: React.FC<CompanyProfileSectionProps> = ({
  companyDetails,
  loading,
  saving,
  error,
  success,
  handleInputChange,
  handleSocialLinkChange,
  handleSubmit,
  loadCompanyDetails,
  valueInput,
  setValueInput,
  valueIcon,
  setValueIcon,
  handleAddValue,
  handleRemoveValue
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading company details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
          <button 
            onClick={loadCompanyDetails}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{success}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={companyDetails.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Logo URL</label>
                <input
                  type="text"
                  name="logo"
                  value={companyDetails.logo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={companyDetails.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={companyDetails.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Founded Year</label>
                <input
                  type="text"
                  name="foundedYear"
                  value={companyDetails.foundedYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Company Size</label>
                <Select
                  value={companyDetails.size || undefined}
                  onChange={(val) =>
                    handleInputChange({ target: { name: 'size', value: val || '' } } as any)
                  }
                  allowEmpty
                  placeholder="Select size"
                  className="w-full"
                  options={[
                    { label: '1-10 employees', value: '1-10' },
                    { label: '11-50 employees', value: '11-50' },
                    { label: '51-200 employees', value: '51-200' },
                    { label: '201-500 employees', value: '201-500' },
                    { label: '501-1000 employees', value: '501-1000' },
                    { label: '1001+ employees', value: '1001+' },
                  ]}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={companyDetails.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md h-32"
            />
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  name="socialLinks.linkedin"
                  value={companyDetails.socialLinks.linkedin}
                  onChange={handleSocialLinkChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Twitter</label>
                <input
                  type="url"
                  name="socialLinks.twitter"
                  value={companyDetails.socialLinks.twitter}
                  onChange={handleSocialLinkChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  name="socialLinks.facebook"
                  value={companyDetails.socialLinks.facebook}
                  onChange={handleSocialLinkChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={companyDetails.socialLinks.instagram}
                  onChange={handleSocialLinkChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Company Culture</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Mission</label>
              <textarea
                name="mission"
                value={companyDetails.mission}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md h-24"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Vision</label>
              <textarea
                name="vision"
                value={companyDetails.vision}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md h-24"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Values</label>
              <div className="flex flex-col mb-2">
                <div className="flex items-center">
                  <IconDropdown 
                    selectedIcon={valueIcon} 
                    onSelectIcon={(icon) => setValueIcon(icon)} 
                  />
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    onKeyDown={(e) => {
                      // Handle Enter key to add value
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddValue();
                      }
                    }}
                    placeholder="Enter a company value"
                    className="w-full px-3 py-2 border rounded-md mr-2"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={handleAddValue}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="mt-2">
                {Array.isArray(companyDetails.values) && companyDetails.values.map((value, index) => (
                  <div key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {typeof value === 'object' && value.icon && <i className={`bi bi-${value.icon} mr-1`}></i>}
                    {typeof value === 'object' ? value.text : String(value)}
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanyProfileSection;
