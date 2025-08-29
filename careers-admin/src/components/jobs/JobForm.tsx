import React, { useState, useEffect, useCallback } from 'react';
import { JobCreateDto, JobUpdateDto, JobStatus } from '../../services/jobService';
import { companyService, CompanyDetails } from '../../services/company.service';
import { officesService, Office } from '../../services/officesService';
import { departmentService, Department } from '../../services/departmentService';
import { jobRoleService, JobRole } from '../../services/jobRoleService';

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
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<string>('');
  const [isLoadingJobRoles, setIsLoadingJobRoles] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch job roles for a department
  const fetchJobRolesForDepartment = useCallback(async (department: Department) => {
    if (!department || !department.jobRoles || department.jobRoles.length === 0) {
      setJobRoles([]);
      return;
    }
    
    setIsLoadingJobRoles(true);
    try {
      const jobRolePromises = department.jobRoles.map(roleId => 
        jobRoleService.get(roleId)
      );
      
      const fetchedRoles = await Promise.all(jobRolePromises);
      setJobRoles(fetchedRoles);
      
      // If editing and we have a title that matches a job role, select that role
      if (isEdit && initialData?.title) {
        const matchingRole = fetchedRoles.find(role => role.title === initialData.title);
        if (matchingRole) {
          setSelectedJobRole(matchingRole._id);
        }
      }
    } catch (err) {
      console.error('Error fetching job roles:', err);
      setJobRoles([]);
    } finally {
      setIsLoadingJobRoles(false);
    }
  }, [isEdit, initialData, setJobRoles, setSelectedJobRole, setIsLoadingJobRoles]);

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
          
          // Set initial office and update location if not in edit mode
          if (officesData.length > 0 && !isEdit) {
            const firstOffice = officesData[0];
            setSelectedOffice(firstOffice._id);
            
            // Update location based on selected office and work arrangement
            const newLocation = `${firstOffice.address} (${workArrangement})`;
            setFormData(prev => ({
              ...prev,
              location: newLocation
            }));
          }
          
          // Fetch departments
          const departmentsData = await departmentService.getAll();
          setDepartments(departmentsData);
          
          // If editing and department is selected, set the department and fetch job roles
          if (isEdit && initialData?.departmentIds && initialData.departmentIds.length > 0) {
            const deptId = initialData.departmentIds[0]; // Use the first department
            setSelectedDepartment(deptId);
            
            // Fetch job roles for this department
            const dept = departmentsData.find(d => d._id === deptId);
            if (dept && dept.jobRoles && dept.jobRoles.length > 0) {
              await fetchJobRolesForDepartment(dept);
            }
          }
          
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
  }, [formData.companyId, isEdit, initialData, workArrangement, fetchJobRolesForDepartment]);
  
  
  // Handle department selection
  useEffect(() => {
    if (selectedDepartment) {
      const department = departments.find(d => d._id === selectedDepartment);
      if (department) {
        fetchJobRolesForDepartment(department);
        
        // Update departmentIds in formData
        setFormData(prev => ({
          ...prev,
          departmentIds: [selectedDepartment]
        }));
      }
    }
  }, [selectedDepartment, departments, fetchJobRolesForDepartment]);
  
  // Handle job role selection
  useEffect(() => {
    if (selectedJobRole) {
      const role = jobRoles.find(r => r._id === selectedJobRole);
      if (role) {
        // Prefill the title from the selected role
        setFormData(prev => ({
          ...prev,
          title: role.title
        }));
      }
    }
  }, [selectedJobRole, jobRoles]);

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

  // Status is always set to DRAFT for new jobs and managed via buttons after creation

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

      {/* Department and Job Role fields always visible at the top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department *
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedJobRole(''); // Reset job role when department changes
            }}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select a department</option>
            {departments.map(department => (
              <option key={department._id} value={department._id}>
                {department.title}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-1">
            Job Role
          </label>
          <select
            id="jobRole"
            value={selectedJobRole}
            onChange={(e) => setSelectedJobRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={!selectedDepartment || isLoadingJobRoles}
          >
            <option value="">Select a job role (optional)</option>
            {isLoadingJobRoles ? (
              <option value="" disabled>Loading job roles...</option>
            ) : jobRoles.length === 0 ? (
              <option value="" disabled>No job roles available for this department</option>
            ) : (
              jobRoles.map(role => (
                <option key={role._id} value={role._id}>
                  {role.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
      
      {selectedDepartment && selectedJobRole && (
        <>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoading || !selectedDepartment}
            >
              {isLoading ? 'Saving...' : isEdit ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default JobForm;
