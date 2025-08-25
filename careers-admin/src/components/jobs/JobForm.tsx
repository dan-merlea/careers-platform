import React, { useState, useEffect } from 'react';
import { JobCreateDto, JobUpdateDto, JobStatus } from '../../services/jobService';
import { companyService, CompanyDetails } from '../../services/company.service';
import { officesService, Office } from '../../services/officesService';
import { departmentService, Department } from '../../services/departmentService';

interface JobFormProps {
  initialData?: JobCreateDto | JobUpdateDto;
  onSubmit: (data: JobCreateDto | JobUpdateDto) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<JobCreateDto | JobUpdateDto>({
    internalId: '',
    title: '',
    companyId: '',
    location: '',
    content: '',
    departmentIds: [],
    officeIds: [],
    status: JobStatus.DRAFT,
    ...initialData
  });
  
  const [useCustomLocation, setUseCustomLocation] = useState<boolean>(initialData?.location ? true : false);
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [workArrangement, setWorkArrangement] = useState<string>('onsite');

  const [, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch company details
        const company = await companyService.getCompanyDetails();
        setCompanyDetails(company);
        
        if (company && company._id) {
          // Set company ID if not already set
          if (!formData.companyId) {
            setFormData(prev => ({
              ...prev,
              companyId: company._id
            }));
          }
          
          // Fetch offices
          const officesData = await officesService.getAll();
          setOffices(officesData);
          
          // Fetch departments
          const departmentsData = await departmentService.getAll();
          setDepartments(departmentsData);
          
          // Initialize location-related state for edit mode
          if (isEdit && initialData?.location) {
            // Check if the location matches any office address
            const locationLower = initialData.location.toLowerCase();
            let matchFound = false;
            
            for (const office of officesData) {
              if (locationLower.includes(office.address.toLowerCase())) {
                // Extract work arrangement from location if present
                let arrangement = 'onsite';
                if (locationLower.includes('hybrid')) arrangement = 'hybrid';
                if (locationLower.includes('remote')) arrangement = 'remote';
                
                setSelectedOffice(office._id);
                setWorkArrangement(arrangement);
                setUseCustomLocation(false);
                matchFound = true;
                break;
              }
            }
            
            // If no match found, use custom location
            if (!matchFound) {
              setUseCustomLocation(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [formData.companyId, isEdit, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name } = e.target;
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    
    setFormData({
      ...formData,
      [name]: selectedOptions
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as JobStatus;
    setFormData({
      ...formData,
      status: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="internalId" className="block text-sm font-medium text-gray-700 mb-1">
            Internal ID <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            id="internalId"
            name="internalId"
            value={formData.internalId || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Default: 0"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        
        <div className="space-y-3">
          {/* Office selection with work arrangement */}
          {!useCustomLocation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <select
                  id="office-select"
                  value={selectedOffice}
                  onChange={(e) => {
                    setSelectedOffice(e.target.value);
                    if (e.target.value) {
                      const office = offices.find(o => o._id === e.target.value);
                      if (office) {
                        // Update location based on selected office and work arrangement
                        const newLocation = `${office.address} (${workArrangement})`;
                        setFormData({
                          ...formData,
                          location: newLocation
                        });
                      }
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select an office</option>
                  {offices.map(office => (
                    <option key={office._id} value={office._id}>
                      {office.name} - {office.address}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  id="work-arrangement"
                  value={workArrangement}
                  onChange={(e) => {
                    setWorkArrangement(e.target.value);
                    if (selectedOffice) {
                      const office = offices.find(o => o._id === selectedOffice);
                      if (office) {
                        // Update location based on selected office and work arrangement
                        const newLocation = `${office.address} (${e.target.value})`;
                        setFormData({
                          ...formData,
                          location: newLocation
                        });
                      }
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Custom location input */}
          {useCustomLocation && (
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          )}
          
          {/* Toggle between dropdown and custom input */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="use-custom-location"
              checked={useCustomLocation}
              onChange={() => {
                setUseCustomLocation(!useCustomLocation);
                if (!useCustomLocation) {
                  // Switching to custom input
                  setSelectedOffice('');
                  setWorkArrangement('onsite');
                } else {
                  // Switching to dropdown
                  setFormData({
                    ...formData,
                    location: ''
                  });
                }
              }}
              className="mr-2"
            />
            <label htmlFor="use-custom-location" className="text-sm text-gray-600">
              Use custom location
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status || JobStatus.DRAFT}
          onChange={handleStatusChange}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value={JobStatus.DRAFT}>Draft</option>
          <option value={JobStatus.PUBLISHED}>Published</option>
          <option value={JobStatus.ARCHIVED}>Archived</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="departmentIds" className="block text-sm font-medium text-gray-700 mb-1">
            Departments
          </label>
          <select
            id="departmentIds"
            name="departmentIds"
            multiple
            value={formData.departmentIds || []}
            onChange={handleMultiSelectChange}
            className="w-full p-2 border border-gray-300 rounded h-32"
          >
            {departments.map(department => (
              <option key={department._id} value={department._id}>
                {department.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div>
          <label htmlFor="officeIds" className="block text-sm font-medium text-gray-700 mb-1">
            Offices
          </label>
          <select
            id="officeIds"
            name="officeIds"
            multiple
            value={formData.officeIds || []}
            onChange={handleMultiSelectChange}
            className="w-full p-2 border border-gray-300 rounded h-32"
          >
            {offices.map(office => (
              <option key={office._id} value={office._id}>
                {office.name} - {office.address}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Job Description *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
          rows={10}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEdit ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
