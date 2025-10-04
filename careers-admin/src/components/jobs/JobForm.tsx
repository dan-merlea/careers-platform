import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/QuillEditor.css';
import { JobCreateDto, JobUpdateDto, JobStatus } from '../../services/jobService';
import { companyService, CompanyDetails } from '../../services/company.service';
import { officesService, Office } from '../../services/officesService';
import { departmentService, Department } from '../../services/departmentService';
import { jobRoleService, JobRole } from '../../services/jobRoleService';
import jobTemplateService, { JobTemplate } from '../../services/jobTemplateService';
import jobBoardsService, { JobBoard } from '../../services/jobBoardsService';
import { userService, User } from '../../services/userService';
import SaveTemplateModal from './SaveTemplateModal';
import { format } from 'date-fns';
import Select from '../common/Select';
import MultiSelect from '../common/MultiSelect';
import Button from '../common/Button';

interface JobFormProps {
  initialData?: JobCreateDto | JobUpdateDto;
  onSubmit: (data: JobCreateDto | JobUpdateDto) => void;
  onCancel: () => void;
  isEdit?: boolean;
  isFromHeadcount?: boolean;
  headcountRequestId?: string;
  isFromJobBoard?: boolean;
  jobBoardId?: string;
}

const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  isFromHeadcount = false,
  headcountRequestId,
  isFromJobBoard = false,
  jobBoardId
}) => {
  const [formData, setFormData] = useState<JobCreateDto | JobUpdateDto>({
    internalId: '',
    title: '',
    location: '',
    content: '',
    departmentIds: [],
    officeIds: [],
    status: JobStatus.DRAFT,
    hiringManagerId: '',
    ...initialData
  });
  
  const [useCustomLocation, setUseCustomLocation] = useState<boolean>(initialData?.location ? true : false);
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [workArrangement, setWorkArrangement] = useState<string>('onsite');

  const [, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  // Track if fields should be locked (for headcount-based jobs)
  const [lockedFields, setLockedFields] = useState<{[key: string]: boolean}>({});
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<string>('');
  const [isLoadingJobRoles, setIsLoadingJobRoles] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [jobBoards, setJobBoards] = useState<JobBoard[]>([]);
  const [isLoadingJobBoards, setIsLoadingJobBoards] = useState(false);
  const [hiringManagers, setHiringManagers] = useState<User[]>([]);
  const [isLoadingHiringManagers, setIsLoadingHiringManagers] = useState(false);

  // Function to fetch templates for a job role
  const fetchTemplatesForRole = useCallback(async (roleId: string) => {
    if (!roleId) {
      setTemplates([]);
      return;
    }
    
    console.log('Fetching templates for role ID:', roleId);
    setIsLoadingTemplates(true);
    try {
      const roleTemplates = await jobTemplateService.getByRole(roleId);
      console.log('Templates received:', roleTemplates);
      setTemplates(roleTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  // Function to load a template content
  const loadTemplate = (template: JobTemplate) => {
    setFormData(prev => ({
      ...prev,
      content: template.content
    }));
  };

  // Function to fetch job roles for a department
  const fetchJobRolesForDepartment = useCallback(async (department: Department) => {
    if (!department || !department._id) {
      setJobRoles([]);
      return;
    }
    
    setIsLoadingJobRoles(true);
    try {
      // Use jobRoleService.getByDepartment to get all job roles for this department
      const fetchedRoles = await jobRoleService.getByDepartment(department._id);
      console.log('Fetched job roles for department:', fetchedRoles);
      
      setJobRoles(fetchedRoles);
      
      // If from headcount and we have a roleTitle, try to find matching job role
      if ((isEdit || isFromHeadcount) && initialData?.roleTitle) {
        console.log('Looking for matching role with title:', initialData.roleTitle);
        
        // Try exact match first
        let matchingRole = fetchedRoles.find(role => role.title === initialData.roleTitle);
        
        // If no exact match, try case-insensitive match
        if (!matchingRole) {
          matchingRole = fetchedRoles.find(role => 
            role.title.toLowerCase() === initialData.roleTitle?.toLowerCase());
        }
        
        // If still no match, try partial match
        if (!matchingRole) {
          matchingRole = fetchedRoles.find(role => 
            role.title.toLowerCase().includes(initialData.roleTitle?.toLowerCase() || '') || 
            (initialData.roleTitle?.toLowerCase() || '').includes(role.title.toLowerCase())
          );
        }
        
        if (matchingRole) {
          console.log('Found matching role:', matchingRole);
          setSelectedJobRole(matchingRole._id);
        } else {
          console.warn('No matching role found for:', initialData.roleTitle);
        }
      }
    } catch (err) {
      console.error('Error fetching job roles:', err);
      setJobRoles([]);
    } finally {
      setIsLoadingJobRoles(false);
    }
  }, [isEdit, isFromHeadcount, initialData, setJobRoles, setSelectedJobRole, setIsLoadingJobRoles]);

  // Set up locked fields for headcount-based jobs and job board-based jobs
  useEffect(() => {
    // Create a new object instead of spreading the existing one to avoid dependency loop
    const newLockedFields: {[key: string]: boolean} = {};
    
    if (isFromHeadcount) {
      newLockedFields.department = true;
      newLockedFields.jobRole = true;
    }
    
    if (isFromJobBoard) {
      newLockedFields.jobBoard = true;
    }
    
    setLockedFields(newLockedFields);
  }, [isFromHeadcount, isFromJobBoard]); // Remove lockedFields from dependencies

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch company details
        const company = await companyService.getCompanyDetails();
        setCompanyDetails(company);
        
        // Fetch job boards
        setIsLoadingJobBoards(true);
        const jobBoardsData = await jobBoardsService.getAllJobBoards();
        setJobBoards(jobBoardsData);
        
        // Set initial job board selection to first board in the list if creating from headcount
        if (isFromHeadcount && jobBoardsData.length > 0 && !formData.jobBoardId) {
          setFormData(prev => ({
            ...prev,
            jobBoardId: jobBoardsData[0]._id
          }));
        }
        
        setIsLoadingJobBoards(false);
        
        // Fetch hiring managers (managers, directors, and admins)
        setIsLoadingHiringManagers(true);
        const hiringManagersData = await userService.getHiringManagers();
        setHiringManagers(hiringManagersData);
        setIsLoadingHiringManagers(false);
        
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
        
        // If editing or from headcount and department is selected, set the department and fetch job roles
        if ((isEdit || isFromHeadcount) && initialData?.departmentIds && initialData.departmentIds.length > 0) {
          const deptId = initialData.departmentIds[0]; // Use the first department
          console.log('Setting selected department ID:', deptId);
          setSelectedDepartment(deptId);
          
          // Fetch job roles for this department
          const dept = departmentsData.find(d => d._id === deptId);
          console.log('Found department:', dept);
          
          if (dept && dept.jobRoles && dept.jobRoles.length > 0) {
            await fetchJobRolesForDepartment(dept);
            
            // If we have a roleTitle from headcount request, try to find matching job role
            if (isFromHeadcount && initialData?.roleTitle) {
              console.log('Looking for matching role with title:', initialData.roleTitle);
              
              try {
                // Fetch all job roles for the department to find a match
                const allRoles = await jobRoleService.getByDepartment(deptId);
                console.log('All roles for department:', allRoles);
                
                // Find role that matches the title from headcount request
                // Try exact match first
                let matchingRole = allRoles.find((role: JobRole) => 
                  role.title === initialData.roleTitle);
                
                // If no exact match, try case-insensitive match
                if (!matchingRole) {
                  matchingRole = allRoles.find((role: JobRole) => 
                    role.title.toLowerCase() === initialData.roleTitle?.toLowerCase());
                }
                
                // If still no match, try partial match
                if (!matchingRole) {
                  matchingRole = allRoles.find((role: JobRole) => 
                    role.title.toLowerCase().includes(initialData.roleTitle?.toLowerCase() || '') || 
                    (initialData.roleTitle?.toLowerCase() || '').includes(role.title.toLowerCase())
                  );
                }
                
                if (matchingRole) {
                  console.log('Found matching role:', matchingRole);
                  setSelectedJobRole(matchingRole._id);
                  
                  // Also fetch templates for this role
                  await fetchTemplatesForRole(matchingRole._id);
                } else {
                  console.warn('No matching role found for:', initialData.roleTitle);
                }
              } catch (error) {
                console.error('Error finding matching job role:', error);
              }
            }
          } else {
            console.warn('Department has no job roles or department not found');
          }
        } else {
          console.log('No department IDs in initialData or not from headcount/edit');
        }
        
        // Log initialData for debugging
        console.log('Initial data received:', initialData);
        
        // Initialize location-related state for edit mode or headcount requests
        if ((isEdit || isFromHeadcount) && initialData?.location) {
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
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [formData.companyId, isEdit, isFromHeadcount, initialData, workArrangement, fetchJobRolesForDepartment]);
  
  // Effect to fetch job roles when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const department = departments.find(d => d._id === selectedDepartment);
      if (department) {
        fetchJobRolesForDepartment(department);
      }
    } else {
      setJobRoles([]);
    }
  }, [selectedDepartment, departments, fetchJobRolesForDepartment, fetchTemplatesForRole, formData.jobBoardId]);
  
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
        
        // Fetch templates for this role using the ID
        fetchTemplatesForRole(selectedJobRole);
      }
    } else {
      // No need to call fetchTemplatesForRole with empty ID
      // as it will just set templates to empty array
      setTemplates([]);
    }
  }, [selectedJobRole, jobRoles, fetchTemplatesForRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for hiringManagerId to prevent empty strings being sent to server
    if (name === 'hiringManagerId' && value === '') {
      // Remove the hiringManagerId property entirely if empty string
      const updatedFormData = { ...formData };
      delete updatedFormData.hiringManagerId;
      setFormData(updatedFormData);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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
    <>
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
          <Select
            value={selectedDepartment || undefined}
            onChange={(val) => {
              setSelectedDepartment(val || '');
              setSelectedJobRole(''); // Reset job role when department changes
            }}
            placeholder="Select a department"
            allowEmpty
            className="w-full"
            disabled={!!lockedFields.department}
            options={departments.map((department) => ({
              label: department.title,
              value: String((department as any)._id ?? (department as any).id ?? ''),
            }))}
          />
        </div>
        
        <div>
          <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-1">
            Job Role
          </label>
          <Select
            value={selectedJobRole || undefined}
            onChange={(val) => setSelectedJobRole(val || '')}
            placeholder={isLoadingJobRoles ? 'Loading job roles...' : jobRoles.length ? 'Select a job role (optional)' : 'No job roles available'}
            allowEmpty
            className={`w-full ${lockedFields.jobRole ? 'opacity-60' : ''}`}
            disabled={!selectedDepartment || isLoadingJobRoles || !!lockedFields.jobRole}
            options={jobRoles.map((role) => ({ label: role.title, value: role._id }))}
          />
        </div>
      </div>
      
      {selectedDepartment && (
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
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="space-y-3">
              {!useCustomLocation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Select
                      value={selectedOffice || undefined}
                      onChange={(val) => {
                        setSelectedOffice(val || '');
                        if (val) {
                          const office = offices.find((o) => o._id === val);
                          if (office) {
                            const newLocation = `${office.address} (${workArrangement})`;
                            setFormData({ ...formData, location: newLocation });
                          }
                        }
                      }}
                      className="w-full"
                      options={offices.map((office) => ({
                        label: `${office.name} - ${office.address}`,
                        value: office._id,
                      }))}
                    />
                  </div>
                  <div>
                    <Select
                      value={workArrangement}
                      onChange={(val) => {
                        const v = val || 'onsite';
                        setWorkArrangement(v);
                        if (selectedOffice) {
                          const office = offices.find((o) => o._id === selectedOffice);
                          if (office) {
                            const newLocation = `${office.address} (${v})`;
                            setFormData({ ...formData, location: newLocation });
                          }
                        }
                      }}
                      className="w-full"
                      options={[
                        { label: 'Onsite', value: 'onsite' },
                        { label: 'Hybrid', value: 'hybrid' },
                        { label: 'Remote', value: 'remote' },
                      ]}
                    />
                  </div>
                </div>
              )}

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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="use-custom-location"
                  checked={useCustomLocation}
                  onChange={() => {
                    setUseCustomLocation(!useCustomLocation);
                    if (!useCustomLocation) {
                      setSelectedOffice('');
                      setWorkArrangement('onsite');
                    } else {
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
              <MultiSelect
                values={formData.officeIds || []}
                onChange={(vals) => setFormData({ ...formData, officeIds: vals })}
                options={offices.map((office) => ({
                  label: `${office.name} - ${office.address}`,
                  value: office._id,
                }))}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              {selectedJobRole && (
                <div className="relative">
                  {isLoadingTemplates ? (
                    <span className="text-sm text-gray-500">Loading templates...</span>
                  ) : templates.length > 0 ? (
                    <Select
                      value={undefined}
                      onChange={(val) => {
                        if (val) {
                          const template = templates.find((t) => t.id === val);
                          if (template) loadTemplate(template);
                        }
                      }}
                      placeholder="Load template..."
                      allowEmpty
                      className="p-1 text-sm"
                      options={templates.map((template) => ({
                        label: `${template.name} (${format(new Date(template.createdAt), 'MMM d, yyyy')})`,
                        value: template.id,
                      }))}
                    />
                  ) : (
                    <span className="text-sm text-gray-500">No templates available</span>
                  )}
                </div>
              )}
            </div>
            <ReactQuill
              theme="snow"
              value={formData.content || ''}
              onChange={(content) => {
                setFormData(prev => ({
                  ...prev,
                  content
                }));
              }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'blockquote'],
                  [{ 'indent': '-1'}, { 'indent': '+1' }],
                  ['clean']
                ],
              }}
              formats={[
                'header',
                'bold', 'italic', 'underline', 'strike',
                'list', 'bullet',
                'link', 'blockquote',
                'indent'
              ]}
              className="bg-white mb-4 quill-editor"
            />
          </div>

          <div className="flex justify-between mt-8">
            <div>
              <Button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                variant="outline"
                disabled={!selectedJobRole || !formData.content}
                leadingIcon={<i className="bi bi-save"></i>}
              >
                Save as Template
              </Button>
            </div>
            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={onCancel}
                variant="white"
                leadingIcon={<i className="bi bi-x-circle"></i>}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !selectedDepartment}
                leadingIcon={
                  isLoading ? (
                    <i className="bi bi-arrow-repeat animate-spin"></i>
                  ) : isEdit ? (
                    <i className="bi bi-pencil-square"></i>
                  ) : isFromHeadcount ? (
                    <i className="bi bi-briefcase"></i>
                  ) : (
                    <i className="bi bi-plus-circle"></i>
                  )
                }
              >
                {isLoading ? 'Saving...' : isEdit ? 'Update Job' : isFromHeadcount ? 'Create Job from Headcount' : 'Create Job'}
              </Button>
            </div>
          </div>
        </>
      )}
    </form>
    
    <SaveTemplateModal
      isOpen={isTemplateModalOpen}
      onClose={() => setIsTemplateModalOpen(false)}
      content={formData.content || ''}
      role={selectedJobRole || ''}
      roleTitle={jobRoles.find(r => r._id === selectedJobRole)?.title}
      departmentId={selectedDepartment || undefined}
      onSaveSuccess={() => {}}
    />
    </>
  );
};

export default JobForm;
