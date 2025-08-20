import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { companyService, CompanyDetails } from '../services/company.service';
import { headquartersService, Headquarters, CreateHeadquartersDto, UpdateHeadquartersDto } from '../services/headquartersService';
import { departmentService, Department, CreateDepartmentDto, UpdateDepartmentDto } from '../services/departmentService';
import HeadquartersList from '../components/company/HeadquartersList';
import HeadquartersForm from '../components/company/HeadquartersForm';
import DepartmentTree from '../components/company/DepartmentTree';
import DepartmentForm from '../components/company/DepartmentForm';
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
  const [valueInput, setValueInput] = useState('');
  const [valueIcon, setValueIcon] = useState('star');
  
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
  
  // Common Bootstrap icons for company values
  const commonIcons = [
    'star', 'heart', 'check-circle', 'award', 'trophy', 'gem',
    'people', 'globe', 'lightning', 'shield', 'lightbulb', 'hand-thumbs-up'
  ];

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

  // Company Profile Section Component
  const CompanyProfileSection = () => (
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
                <select
                  name="size"
                  value={companyDetails.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001+">1001+ employees</option>
                </select>
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
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    placeholder="Enter a company value"
                    className="w-full px-3 py-2 border rounded-md mr-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddValue}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">Select an icon:</label>
                  <div className="flex flex-wrap gap-2">
                    {commonIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setValueIcon(icon)}
                        className={`p-2 border rounded ${valueIcon === icon ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                        title={icon}
                      >
                        <i className={`bi bi-${icon}`}></i>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                {Array.isArray(companyDetails.values) && companyDetails.values.map((value, index) => (
                  <div key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {typeof value === 'object' && value.icon && <i className={`bi bi-${value.icon} mr-1`}></i>}
                    {typeof value === 'object' ? value.text : value}
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
        <Route path="/" element={<CompanyProfileSection />} />
        <Route path="/headquarters" element={
          <div className="bg-white shadow-md rounded-lg p-6">
            {showHQForm ? (
              <HeadquartersForm
                headquarters={selectedHQ}
                onSubmit={handleHQFormSubmit}
                onCancel={handleHQFormCancel}
                isSubmitting={savingHQ}
              />
            ) : (
              <>
                {hqSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>{hqSuccess}</p>
                  </div>
                )}
                
                {hqError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{hqError}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Headquarters</h2>
                  <button
                    onClick={handleAddHeadquarters}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                  >
                    Add Headquarters
                  </button>
                </div>
                
                {loadingHQ ? (
                  <div className="flex justify-center items-center h-32">
                    <p className="text-gray-500">Loading headquarters...</p>
                  </div>
                ) : (
                  <HeadquartersList
                    headquarters={headquarters}
                    onEdit={handleEditHeadquarters}
                    onDelete={handleDeleteHeadquarters}
                    onAddNew={handleAddHeadquarters}
                  />
                )}
              </>
            )}
          </div>
        } />
        <Route path="/departments" element={
          <div className="bg-white shadow-md rounded-lg p-6">
            {showDeptForm ? (
              <DepartmentForm
                department={selectedDept}
                departments={departments}
                onSubmit={handleDeptFormSubmit}
                onCancel={handleDeptFormCancel}
                isSubmitting={savingDept}
              />
            ) : (
              <>
                {deptSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>{deptSuccess}</p>
                  </div>
                )}
                
                {deptError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{deptError}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Departments</h2>
                  <button
                    onClick={handleAddDepartment}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                  >
                    Add Department
                  </button>
                </div>
                
                {loadingDept ? (
                  <div className="flex justify-center items-center h-32">
                    <p className="text-gray-500">Loading departments...</p>
                  </div>
                ) : (
                  <DepartmentTree
                    departments={departments}
                    onEdit={handleEditDepartment}
                    onDelete={handleDeleteDepartment}
                  />
                )}
              </>
            )}
          </div>
        } />
      </Routes>
    </div>
  );
};

export default CompanyDetailsPage;
