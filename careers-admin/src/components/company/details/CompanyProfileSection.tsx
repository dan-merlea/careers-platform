import React from 'react';
import { CompanyDetails } from '../../../services/company.service';
import IconDropdown from '../../shared/IconDropdown';
import Select from '../../common/Select';
import Input from '../../common/Input';
import Button from '../../common/Button';

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
          <Button onClick={loadCompanyDetails} variant="primary" className="mt-2">
            Retry
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{success}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Company Name</label>
                <Input
                  type="text"
                  name="name"
                  value={companyDetails.name}
                  onChange={handleInputChange as any}
                  className="text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Logo URL</label>
                <Input
                  type="text"
                  name="logo"
                  value={companyDetails.logo}
                  onChange={handleInputChange as any}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Website</label>
                <Input
                  type="url"
                  name="website"
                  value={companyDetails.website}
                  onChange={handleInputChange as any}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Industry</label>
                <Input
                  type="text"
                  name="industry"
                  value={companyDetails.industry}
                  onChange={handleInputChange as any}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Founded Year</label>
                <Input
                  type="text"
                  name="foundedYear"
                  value={companyDetails.foundedYear}
                  onChange={handleInputChange as any}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Company Size</label>
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
                <Input
                  type="url"
                  name="socialLinks.linkedin"
                  value={companyDetails.socialLinks.linkedin}
                  onChange={handleSocialLinkChange as any}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Twitter</label>
                <Input
                  type="url"
                  name="socialLinks.twitter"
                  value={companyDetails.socialLinks.twitter}
                  onChange={handleSocialLinkChange as any}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Facebook</label>
                <Input
                  type="url"
                  name="socialLinks.facebook"
                  value={companyDetails.socialLinks.facebook}
                  onChange={handleSocialLinkChange as any}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Instagram</label>
                <Input
                  type="url"
                  name="socialLinks.instagram"
                  value={companyDetails.socialLinks.instagram}
                  onChange={handleSocialLinkChange as any}
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
                  <Input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput((e.target as HTMLInputElement).value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddValue();
                      }
                    }}
                    placeholder="Enter a company value"
                    className="w-full mr-2"
                    autoComplete="off"
                  />
                  <Button type="button" onClick={handleAddValue} variant="secondary">
                    Add
                  </Button>
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
            <Button type="submit" disabled={saving} variant="primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanyProfileSection;
