import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { companyService, CompanyDetails } from '../services/company.service';
import { headquartersService, Headquarters, CreateHeadquartersDto, UpdateHeadquartersDto } from '../services/headquartersService';
import { departmentService, Department, CreateDepartmentDto, UpdateDepartmentDto } from '../services/departmentService';
import CompanyProfileSection from '../components/company/details/CompanyProfileSection';
import HeadquartersSection from '../components/company/details/HeadquartersSection';
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
    headquarters: '',
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
  const activeSection = path.includes('/headquarters') 
    ? 'headquarters' 
    : path.includes('/departments') 
      ? 'departments' 
      : 'profile';
      
  // State for headquarters section
  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);
  const [loadingHQ, setLoadingHQ] = useState<boolean>(false);
  const [selectedHQ, setSelectedHQ] = useState<Headquarters | undefined>(undefined);
  const [showHQForm, setShowHQForm] = useState<boolean>(false);
  const [savingHQ, setSavingHQ] = useState<boolean>(false);
  const [hqError, setHQError] = useState<string | null>(null);
  const [hqSuccess, setHQSuccess] = useState<string | null>(null);
  
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
    loadHeadquarters();
    loadDepartments();
  }, []);
  
  // Load headquarters data
  const loadHeadquarters = async () => {
    try {
      setLoadingHQ(true);
      const data = await headquartersService.getAll();
      setHeadquarters(data);
      setHQError(null);
    } catch (err) {
      console.error('Error loading headquarters:', err);
      setHQError('Failed to load headquarters. Please try again.');
    } finally {
      setLoadingHQ(false);
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
  
  // Headquarters CRUD handlers
  const handleCreateHeadquarters = async (data: CreateHeadquartersDto) => {
    try {
      setSavingHQ(true);
      await headquartersService.create(data);
      await loadHeadquarters();
      setShowHQForm(false);
      setSelectedHQ(undefined);
      setHQSuccess('Headquarters created successfully');
      setTimeout(() => setHQSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating headquarters:', err);
      setHQError('Failed to create headquarters. Please try again.');
    } finally {
      setSavingHQ(false);
    }
  };
  
  const handleUpdateHeadquarters = async (id: string, data: UpdateHeadquartersDto) => {
    try {
      setSavingHQ(true);
      await headquartersService.update(id, data);
      await loadHeadquarters();
      setShowHQForm(false);
      setSelectedHQ(undefined);
      setHQSuccess('Headquarters updated successfully');
      setTimeout(() => setHQSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating headquarters:', err);
      setHQError('Failed to update headquarters. Please try again.');
    } finally {
      setSavingHQ(false);
    }
  };
  
  const handleDeleteHeadquarters = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this headquarters?')) {
      try {
        await headquartersService.delete(id);
        await loadHeadquarters();
        setHQSuccess('Headquarters deleted successfully');
        setTimeout(() => setHQSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting headquarters:', err);
        setHQError('Failed to delete headquarters. Please try again.');
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
  
  // Handle headquarters form actions
  const handleEditHeadquarters = (hq: Headquarters) => {
    setSelectedHQ(hq);
    setShowHQForm(true);
  };
  
  const handleAddHeadquarters = () => {
    setSelectedHQ(undefined);
    setShowHQForm(true);
  };
  
  const handleHQFormSubmit = async (data: CreateHeadquartersDto | UpdateHeadquartersDto) => {
    if (selectedHQ && selectedHQ._id) {
      await handleUpdateHeadquarters(selectedHQ._id, data as UpdateHeadquartersDto);
    } else {
      await handleCreateHeadquarters(data as CreateHeadquartersDto);
    }
  };
  
  const handleHQFormCancel = () => {
    setShowHQForm(false);
    setSelectedHQ(undefined);
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
          onClick={() => handleSectionChange('headquarters')}
          className={`py-2 px-4 mr-2 ${activeSection === 'headquarters' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Headquarters
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
        <Route path="/headquarters" element={
          <HeadquartersSection
            headquarters={headquarters}
            loadingHQ={loadingHQ}
            selectedHQ={selectedHQ}
            showHQForm={showHQForm}
            savingHQ={savingHQ}
            hqError={hqError}
            hqSuccess={hqSuccess}
            handleEditHeadquarters={handleEditHeadquarters}
            handleAddHeadquarters={handleAddHeadquarters}
            handleHQFormSubmit={handleHQFormSubmit}
            handleHQFormCancel={handleHQFormCancel}
            handleDeleteHeadquarters={handleDeleteHeadquarters}
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
