import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import CompanySettingsPage from './CompanySettingsPage';
import { CompanyDetails } from '../services/company.service';
import { useCompany } from '../context/CompanyContext';
import { officesService, Office, CreateOfficeDto, UpdateOfficeDto } from '../services/officesService';
import { departmentService, Department, CreateDepartmentDto, UpdateDepartmentDto } from '../services/departmentService';
import { jobFunctionService, JobFunction, CreateJobFunctionDto, UpdateJobFunctionDto } from '../services/jobFunctionService';
import { jobRoleService, JobRole, CreateJobRoleDto, UpdateJobRoleDto } from '../services/jobRoleService';
import CompanyProfileSection from '../components/company/details/CompanyProfileSection';
import OfficesSection from '../components/company/details/OfficesSection';
import DepartmentsSection from '../components/company/details/DepartmentsSection';
import JobFunctionsSection from '../components/company/details/JobFunctionsSection';
import JobRolesSection from '../components/company/details/JobRolesSection';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CompanyDetailsPage: React.FC = () => {
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use CompanyContext
  const { company, loading: companyLoading, updateCompany, refreshCompany } = useCompany();
  
  // Navigation handler
  const handleSectionChange = (section: string) => {
    if (section === 'profile') {
      navigate('/company-details');
    } else {
      navigate(`/company-details/${section}`);
    }
  };
  
  // Initialize with empty company details
  const emptyCompanyDetails: CompanyDetails = {
    name: '',
    logo: '',
    website: '',
    description: '',
    industry: '',
    foundedYear: '',
    size: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    },
    mission: '',
    vision: '',
    values: []
  };
  
  // State for company profile section
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(company || emptyCompanyDetails);
  
  // Use context loading state directly
  const loading = companyLoading;
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [valueInput, setValueInput] = useState<string>('');
  const [valueIcon, setValueIcon] = useState<string>('');
  
  // Determine active section based on URL path
  const path = location.pathname;
  const activeSection = path.includes('/offices') 
    ? 'offices' 
    : path.includes('/departments') 
      ? 'departments' 
      : path.includes('/job-functions')
        ? 'job-functions'
        : path.includes('/job-roles')
          ? 'job-roles'
          : path.includes('/settings')
            ? 'settings'
            : 'profile';
      
  // State for offices section
  const [offices, setOffices] = useState<Office[]>([]);
  const [loadingOffice, setLoadingOffice] = useState<boolean>(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | undefined>(undefined);
  const [showOfficeForm, setShowOfficeForm] = useState<boolean>(false);
  const [savingOffice, setSavingOffice] = useState<boolean>(false);
  const [officeError, setOfficeError] = useState<string | null>(null);
  const [officeSuccess, setOfficeSuccess] = useState<string | null>(null);
  
  // State for departments section
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDept, setLoadingDept] = useState<boolean>(false);
  const [selectedDept, setSelectedDept] = useState<Department | undefined>(undefined);
  const [showDeptForm, setShowDeptForm] = useState<boolean>(false);
  const [savingDept, setSavingDept] = useState<boolean>(false);
  const [deptError, setDeptError] = useState<string | null>(null);
  const [deptSuccess, setDeptSuccess] = useState<string | null>(null);

  // State for job functions section
  const [jobFunctions, setJobFunctions] = useState<JobFunction[]>([]);
  const [loadingJobFunction, setLoadingJobFunction] = useState<boolean>(false);
  const [selectedJobFunction, setSelectedJobFunction] = useState<JobFunction | undefined>(undefined);
  const [showJobFunctionForm, setShowJobFunctionForm] = useState<boolean>(false);
  const [savingJobFunction, setSavingJobFunction] = useState<boolean>(false);
  const [jobFunctionError, setJobFunctionError] = useState<string | null>(null);
  const [jobFunctionSuccess, setJobFunctionSuccess] = useState<string | null>(null);

  // State for job roles section
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loadingJobRole, setLoadingJobRole] = useState<boolean>(false);
  const [selectedJobRole, setSelectedJobRole] = useState<JobRole | undefined>(undefined);
  const [showJobRoleForm, setShowJobRoleForm] = useState<boolean>(false);
  const [savingJobRole, setSavingJobRole] = useState<boolean>(false);
  const [jobRoleError, setJobRoleError] = useState<string | null>(null);
  const [jobRoleSuccess, setJobRoleSuccess] = useState<string | null>(null);

  // Define loadCompanyDetails with useCallback to prevent unnecessary re-renders
  const loadCompanyDetails = useCallback(async () => {
    try {
      // Use refreshCompany from context to refresh company data
      await refreshCompany();
      setError(null);
    } catch (err) {
      console.error('Error loading company details:', err);
      setError('Failed to load company details. Please try again.');
    }
  }, [refreshCompany]);
  
  // Initial data loading
  useEffect(() => {
    loadCompanyDetails();
    loadOffices();
    loadDepartments();
    loadJobFunctions();
    loadJobRoles();
  }, [loadCompanyDetails]);
  
  // Sync local state with context whenever company changes
  useEffect(() => {
    if (company) {
      setCompanyDetails(company);
    }
  }, [company]);
  
  // Load offices data
  const loadOffices = async () => {
    try {
      setLoadingOffice(true);
      const data = await officesService.getAll();
      setOffices(data);
      setOfficeError(null);
    } catch (err) {
      console.error('Error loading offices:', err);
      setOfficeError('Failed to load offices. Please try again.');
    } finally {
      setLoadingOffice(false);
    }
  };
  
  // Load departments data with hierarchical structure
  const loadDepartments = async () => {
    try {
      setLoadingDept(true);
      const data = await departmentService.getHierarchy();
      setDepartments(data);
      setDeptError(null);
    } catch (err) {
      console.error('Error loading departments:', err);
      setDeptError('Failed to load departments. Please try again.');
    } finally {
      setLoadingDept(false);
    }
  };
  
  // Offices CRUD handlers
  const handleCreateOffice = async (data: CreateOfficeDto) => {
    try {
      setSavingOffice(true);
      await officesService.create(data);
      await loadOffices();
      setShowOfficeForm(false);
      setSelectedOffice(undefined);
      setOfficeSuccess('Office created successfully');
      setTimeout(() => setOfficeSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating office:', err);
      setOfficeError('Failed to create office. Please try again.');
    } finally {
      setSavingOffice(false);
    }
  };
  
  const handleUpdateOffice = async (id: string, data: UpdateOfficeDto) => {
    try {
      setSavingOffice(true);
      await officesService.update(id, data);
      await loadOffices();
      setShowOfficeForm(false);
      setSelectedOffice(undefined);
      setOfficeSuccess('Office updated successfully');
      setTimeout(() => setOfficeSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating office:', err);
      setOfficeError('Failed to update office. Please try again.');
    } finally {
      setSavingOffice(false);
    }
  };
  
  const handleDeleteOffice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this office?')) {
      try {
        await officesService.delete(id);
        await loadOffices();
        setOfficeSuccess('Office deleted successfully');
        setTimeout(() => setOfficeSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting office:', err);
        setOfficeError('Failed to delete office. Please try again.');
      }
    }
  };
  
  // Department CRUD handlers
  const handleCreateDepartment = async (data: CreateDepartmentDto) => {
    try {
      setSavingDept(true);
      await departmentService.create(data);
      await loadDepartments();
      setShowDeptForm(false);
      setSelectedDept(undefined);
      setDeptSuccess('Department created successfully');
      setTimeout(() => setDeptSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating department:', err);
      setDeptError('Failed to create department. Please try again.');
    } finally {
      setSavingDept(false);
    }
  };
  
  const handleUpdateDepartment = async (id: string, data: UpdateDepartmentDto) => {
    try {
      setSavingDept(true);
      await departmentService.update(id, data);
      await loadDepartments();
      setShowDeptForm(false);
      setSelectedDept(undefined);
      setDeptSuccess('Department updated successfully');
      setTimeout(() => setDeptSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating department:', err);
      setDeptError('Failed to update department. Please try again.');
    } finally {
      setSavingDept(false);
    }
  };
  
  const handleDeleteDepartment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentService.delete(id);
        await loadDepartments();
        setDeptSuccess('Department deleted successfully');
        setTimeout(() => setDeptSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting department:', err);
        setDeptError('Failed to delete department. Please try again.');
      }
    }
  };

  // loadCompanyDetails is now defined with useCallback above

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (like socialLinks.linkedin)
      const [parent, child] = name.split('.');
      setCompanyDetails(prev => {
        if (parent === 'socialLinks') {
          return {
            ...prev,
            socialLinks: {
              ...prev.socialLinks,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setCompanyDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const socialType = name.split('.')[1]; // Extract social media type (linkedin, twitter, etc.)
    
    setCompanyDetails(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [socialType]: value
      }
    }));
  };

  const handleAddValue = () => {
    if (valueInput.trim()) {
      setCompanyDetails(prev => ({
        ...prev,
        values: [...(Array.isArray(prev.values) ? prev.values : []), { text: valueInput.trim(), icon: valueIcon }]
      }));
      setValueInput('');
      // Keep the selected icon for the next value
    }
  };

  const handleRemoveValue = (index: number) => {
    setCompanyDetails(prev => ({
      ...prev,
      values: Array.isArray(prev.values) ? prev.values.filter((_, i) => i !== index) : []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    
    try {
      // Use updateCompany from context to update company details
      await updateCompany(companyDetails);
      setSuccess('Company details updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating company details:', err);
      setError('Failed to update company details. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle offices form actions
  const handleEditOffice = (office: Office) => {
    setSelectedOffice(office);
    setShowOfficeForm(true);
  };
  
  const handleAddOffice = () => {
    setSelectedOffice(undefined);
    setShowOfficeForm(true);
  };
  
  const handleOfficeFormSubmit = async (data: CreateOfficeDto | UpdateOfficeDto) => {
    if (selectedOffice && selectedOffice._id) {
      await handleUpdateOffice(selectedOffice._id, data as UpdateOfficeDto);
    } else {
      await handleCreateOffice(data as CreateOfficeDto);
    }
  };
  
  const handleOfficeFormCancel = () => {
    setShowOfficeForm(false);
    setSelectedOffice(undefined);
  };
  
  // Handle department form actions
  const handleEditDepartment = (dept: Department) => {
    setSelectedDept(dept);
    setShowDeptForm(true);
  };
  
  const handleAddDepartment = () => {
    setSelectedDept(undefined);
    setShowDeptForm(true);
  };
  
  const handleDeptFormSubmit = async (data: CreateDepartmentDto | UpdateDepartmentDto) => {
    if (selectedDept && selectedDept._id) {
      await handleUpdateDepartment(selectedDept._id, data as UpdateDepartmentDto);
    } else {
      await handleCreateDepartment(data as CreateDepartmentDto);
    }
  };
  
  const handleDeptFormCancel = () => {
    setShowDeptForm(false);
    setSelectedDept(undefined);
  };

  // Load job functions data
  const loadJobFunctions = async () => {
    try {
      setLoadingJobFunction(true);
      const data = await jobFunctionService.getAll();
      setJobFunctions(data);
      setJobFunctionError(null);
    } catch (err) {
      console.error('Error loading job functions:', err);
      setJobFunctionError('Failed to load job functions. Please try again.');
    } finally {
      setLoadingJobFunction(false);
    }
  };

  // Load job roles data
  const loadJobRoles = async () => {
    try {
      setLoadingJobRole(true);
      const data = await jobRoleService.getAll();
      setJobRoles(data);
      setJobRoleError(null);
    } catch (err) {
      console.error('Error loading job roles:', err);
      setJobRoleError('Failed to load job roles. Please try again.');
    } finally {
      setLoadingJobRole(false);
    }
  };

  // Job Functions CRUD handlers
  const handleCreateJobFunction = async (data: CreateJobFunctionDto) => {
    try {
      setSavingJobFunction(true);
      await jobFunctionService.create(data);
      await loadJobFunctions();
      setShowJobFunctionForm(false);
      setSelectedJobFunction(undefined);
      setJobFunctionSuccess('Job function created successfully');
      setTimeout(() => setJobFunctionSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating job function:', err);
      setJobFunctionError('Failed to create job function. Please try again.');
    } finally {
      setSavingJobFunction(false);
    }
  };

  const handleUpdateJobFunction = async (id: string, data: UpdateJobFunctionDto) => {
    try {
      setSavingJobFunction(true);
      await jobFunctionService.update(id, data);
      await loadJobFunctions();
      setShowJobFunctionForm(false);
      setSelectedJobFunction(undefined);
      setJobFunctionSuccess('Job function updated successfully');
      setTimeout(() => setJobFunctionSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating job function:', err);
      setJobFunctionError('Failed to update job function. Please try again.');
    } finally {
      setSavingJobFunction(false);
    }
  };

  const handleDeleteJobFunction = async (id: string) => {
    try {
      await jobFunctionService.delete(id);
      await loadJobFunctions();
      setJobFunctionSuccess('Job function deleted successfully');
      setTimeout(() => setJobFunctionSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting job function:', err);
      setJobFunctionError('Failed to delete job function. Please try again.');
    }
  };

  // Job Roles CRUD handlers
  const handleCreateJobRole = async (data: CreateJobRoleDto) => {
    try {
      setSavingJobRole(true);
      await jobRoleService.create(data);
      await loadJobRoles();
      setShowJobRoleForm(false);
      setSelectedJobRole(undefined);
      setJobRoleSuccess('Job role created successfully');
      setTimeout(() => setJobRoleSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating job role:', err);
      setJobRoleError('Failed to create job role. Please try again.');
    } finally {
      setSavingJobRole(false);
    }
  };

  const handleUpdateJobRole = async (id: string, data: UpdateJobRoleDto) => {
    try {
      setSavingJobRole(true);
      await jobRoleService.update(id, data);
      await loadJobRoles();
      setShowJobRoleForm(false);
      setSelectedJobRole(undefined);
      setJobRoleSuccess('Job role updated successfully');
      setTimeout(() => setJobRoleSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating job role:', err);
      setJobRoleError('Failed to update job role. Please try again.');
    } finally {
      setSavingJobRole(false);
    }
  };

  const handleDeleteJobRole = async (id: string) => {
    try {
      await jobRoleService.delete(id);
      await loadJobRoles();
      setJobRoleSuccess('Job role deleted successfully');
      setTimeout(() => setJobRoleSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting job role:', err);
      setJobRoleError('Failed to delete job role. Please try again.');
    }
  };

  // Handle job function form actions
  const handleEditJobFunction = (jobFunction: JobFunction) => {
    setSelectedJobFunction(jobFunction);
    setShowJobFunctionForm(true);
  };

  const handleAddJobFunction = () => {
    setSelectedJobFunction(undefined);
    setShowJobFunctionForm(true);
  };

  const handleJobFunctionFormSubmit = async (data: CreateJobFunctionDto | UpdateJobFunctionDto) => {
    if (selectedJobFunction && selectedJobFunction._id) {
      await handleUpdateJobFunction(selectedJobFunction._id, data as UpdateJobFunctionDto);
    } else {
      await handleCreateJobFunction(data as CreateJobFunctionDto);
    }
  };

  const handleJobFunctionFormCancel = () => {
    setShowJobFunctionForm(false);
    setSelectedJobFunction(undefined);
  };

  // Handle job role form actions
  const handleEditJobRole = (jobRole: JobRole) => {
    setSelectedJobRole(jobRole);
    setShowJobRoleForm(true);
  };

  const handleAddJobRole = () => {
    setSelectedJobRole(undefined);
    setShowJobRoleForm(true);
  };

  const handleJobRoleFormSubmit = async (data: CreateJobRoleDto | UpdateJobRoleDto) => {
    if (selectedJobRole && selectedJobRole._id) {
      await handleUpdateJobRole(selectedJobRole._id, data as UpdateJobRoleDto);
    } else {
      await handleCreateJobRole(data as CreateJobRoleDto);
    }
  };

  const handleJobRoleFormCancel = () => {
    setShowJobRoleForm(false);
    setSelectedJobRole(undefined);
  };

  // Render the profile section with all required props
  const renderProfileSection = () => (
    <>
      <CompanyProfileSection
        companyDetails={companyDetails}
        loading={loading}
        saving={saving}
        error={error}
        success={success}
        handleInputChange={handleInputChange}
        handleSocialLinkChange={handleSocialLinkChange}
        handleSubmit={handleSubmit}
        loadCompanyDetails={loadCompanyDetails}
        valueInput={valueInput}
        setValueInput={setValueInput}
        valueIcon={valueIcon}
        setValueIcon={setValueIcon}
        handleAddValue={handleAddValue}
        handleRemoveValue={handleRemoveValue}
      />
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Company Details</h1>
      
      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => handleSectionChange('profile')}
          className={`py-2 px-4 mr-2 ${activeSection === 'profile' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Company Profile
        </button>
        <button
          onClick={() => handleSectionChange('offices')}
          className={`py-2 px-4 mr-2 ${activeSection === 'offices' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Offices
        </button>
        <button
          onClick={() => handleSectionChange('departments')}
          className={`py-2 px-4 mr-2 ${activeSection === 'departments' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Departments
        </button>
        <button
          onClick={() => handleSectionChange('job-functions')}
          className={`py-2 px-4 mr-2 ${activeSection === 'job-functions' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Job Functions
        </button>
        <button
          onClick={() => handleSectionChange('job-roles')}
          className={`py-2 px-4 mr-2 ${activeSection === 'job-roles' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Job Roles
        </button>
        <button
          onClick={() => handleSectionChange('settings')}
          className={`py-2 px-4 ${activeSection === 'settings' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Settings
        </button>
      </div>
      
      {/* Content Area with React Router */}
      <Routes>
        <Route path="/" element={renderProfileSection()} />
        <Route path="/settings" element={<CompanySettingsPage />} />
        <Route path="/offices" element={
          <OfficesSection
            offices={offices}
            loadingOffice={loadingOffice}
            selectedOffice={selectedOffice}
            showOfficeForm={showOfficeForm}
            savingOffice={savingOffice}
            officeError={officeError}
            officeSuccess={officeSuccess}
            handleEditOffice={handleEditOffice}
            handleAddOffice={handleAddOffice}
            handleOfficeFormSubmit={handleOfficeFormSubmit}
            handleOfficeFormCancel={handleOfficeFormCancel}
            handleDeleteOffice={handleDeleteOffice}
          />
        } />
        <Route path="/departments" element={
          <DepartmentsSection
            departments={departments}
            loadingDept={loadingDept}
            selectedDept={selectedDept}
            showDeptForm={showDeptForm}
            savingDept={savingDept}
            deptError={deptError}
            deptSuccess={deptSuccess}
            handleEditDepartment={handleEditDepartment}
            handleAddDepartment={handleAddDepartment}
            handleDeptFormSubmit={handleDeptFormSubmit}
            handleDeptFormCancel={handleDeptFormCancel}
            handleDeleteDepartment={handleDeleteDepartment}
          />
        } />
        <Route path="/job-functions" element={
          <JobFunctionsSection
            jobFunctions={jobFunctions}
            loadingJobFunction={loadingJobFunction}
            selectedJobFunction={selectedJobFunction}
            showJobFunctionForm={showJobFunctionForm}
            savingJobFunction={savingJobFunction}
            jobFunctionError={jobFunctionError}
            jobFunctionSuccess={jobFunctionSuccess}
            handleEditJobFunction={handleEditJobFunction}
            handleAddJobFunction={handleAddJobFunction}
            handleJobFunctionFormSubmit={handleJobFunctionFormSubmit}
            handleJobFunctionFormCancel={handleJobFunctionFormCancel}
            handleDeleteJobFunction={handleDeleteJobFunction}
            companyId={companyDetails._id}
          />
        } />
        <Route path="/job-roles" element={
          <JobRolesSection
            jobRoles={jobRoles}
            jobFunctions={jobFunctions}
            loadingJobRole={loadingJobRole}
            selectedJobRole={selectedJobRole}
            showJobRoleForm={showJobRoleForm}
            savingJobRole={savingJobRole}
            jobRoleError={jobRoleError}
            jobRoleSuccess={jobRoleSuccess}
            handleEditJobRole={handleEditJobRole}
            handleAddJobRole={handleAddJobRole}
            handleJobRoleFormSubmit={handleJobRoleFormSubmit}
            handleJobRoleFormCancel={handleJobRoleFormCancel}
            handleDeleteJobRole={handleDeleteJobRole}
          />
        } />
      </Routes>
    </div>
  );
};

export default CompanyDetailsPage;
