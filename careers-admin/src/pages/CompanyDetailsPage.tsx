import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { companyService, CompanyDetails } from '../services/company.service';
import { officesService, Office, CreateOfficeDto, UpdateOfficeDto } from '../services/officesService';
import { departmentService, Department, CreateDepartmentDto, UpdateDepartmentDto } from '../services/departmentService';
import CompanyProfileSection from '../components/company/details/CompanyProfileSection';
import OfficesSection from '../components/company/details/OfficesSection';
import DepartmentsSection from '../components/company/details/DepartmentsSection';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CompanyDetailsPage: React.FC = () => {
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation handler
  const handleSectionChange = (section: string) => {
    if (section === 'profile') {
      navigate('/company-details');
    } else {
      navigate(`/company-details/${section}`);
    }
  };
  
  // State for company profile section
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
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
  });
  
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    loadCompanyDetails();
    loadOffices();
    loadDepartments();
  }, []);
  
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

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const details = await companyService.getCompanyDetails();
      if (details) {
        setCompanyDetails(details);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading company details:', err);
      setError('Failed to load company details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      await companyService.saveCompanyDetails(companyDetails);
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

  // Render the profile section with all required props
  const renderProfileSection = () => (
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
          className={`py-2 px-4 ${activeSection === 'departments' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Departments
        </button>
      </div>
      
      {/* Content Area with React Router */}
      <Routes>
        <Route path="/" element={renderProfileSection()} />
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
      </Routes>
    </div>
  );
};

export default CompanyDetailsPage;
