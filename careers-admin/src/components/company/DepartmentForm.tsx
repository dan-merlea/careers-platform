import React, { useState, useEffect } from 'react';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../../services/departmentService';
import { UserRole } from '../../services/auth.service';
import { JobRole, jobRoleService } from '../../services/jobRoleService';

interface DepartmentFormProps {
  department?: Department;
  departments: Department[];
  onSubmit: (data: CreateDepartmentDto | UpdateDepartmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  department,
  departments,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<CreateDepartmentDto>({
    title: '',
    parentDepartment: null,
    approvalRole: UserRole.DIRECTOR,
    jobRoles: []
  });
  
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);

  // Fetch job roles
  useEffect(() => {
    const fetchJobRoles = async () => {
      setLoadingJobRoles(true);
      try {
        const roles = await jobRoleService.getAll();
        setJobRoles(roles);
      } catch (error) {
        console.error('Failed to fetch job roles:', error);
      } finally {
        setLoadingJobRoles(false);
      }
    };
    
    fetchJobRoles();
  }, []);

  // Initialize form with department data if provided (edit mode)
  useEffect(() => {
    if (department) {
      setFormData({
        title: department.title,
        parentDepartment: department.parentDepartment || null,
        approvalRole: department.approvalRole || UserRole.DIRECTOR,
        jobRoles: department.jobRoles || []
      });
    }
  }, [department]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'parentDepartment') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle job role selection
  const handleJobRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      jobRoles: selectedOptions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Filter out the current department and its children from parent options to prevent circular references
  const getAvailableParents = () => {
    if (!department || !department.id) {
      return departments;
    }
    
    // Helper function to check if a department is the current one or its descendant
    const isCurrentOrDescendant = (dept: Department): boolean => {
      if (dept.id === department.id) {
        return true;
      }
      
      if (dept.subDepartments && dept.subDepartments.length > 0) {
        return dept.subDepartments.some(child => isCurrentOrDescendant(child));
      }
      
      return false;
    };
    
    return departments.filter(dept => !isCurrentOrDescendant(dept));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Department Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Department title"
          required
        />
      </div>

      <div>
        <label htmlFor="parentDepartment" className="block text-sm font-medium text-gray-700 mb-1">
          Parent Department
        </label>
        <select
          id="parentDepartment"
          name="parentDepartment"
          value={formData.parentDepartment || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">No parent (top-level department)</option>
          {getAvailableParents().map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.title}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select a parent department or leave empty for a top-level department
        </p>
      </div>

      <div>
        <label htmlFor="approvalRole" className="block text-sm font-medium text-gray-700 mb-1">
          Approval Role *
        </label>
        <select
          id="approvalRole"
          name="approvalRole"
          value={formData.approvalRole || UserRole.DIRECTOR}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value={UserRole.ADMIN}>Admin</option>
          <option value={UserRole.DIRECTOR}>Director</option>
          <option value={UserRole.MANAGER}>Manager</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select the role required to approve jobs for this department
        </p>
      </div>

      <div>
        <label htmlFor="jobRoles" className="block text-sm font-medium text-gray-700 mb-1">
          Job Roles
        </label>
        <select
          id="jobRoles"
          name="jobRoles"
          multiple
          value={formData.jobRoles || []}
          onChange={handleJobRoleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          size={5}
          disabled={isSubmitting || loadingJobRoles}
        >
          {loadingJobRoles ? (
            <option disabled>Loading job roles...</option>
          ) : jobRoles.length === 0 ? (
            <option disabled>No job roles available</option>
          ) : (
            jobRoles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.title} ({role.jobFunction.title})
              </option>
            ))
          )}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Hold Ctrl/Cmd to select multiple job roles relevant for this department
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : department ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default DepartmentForm;
