import React, { useState, useEffect } from 'react';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../../services/departmentService';
import { UserRole } from '../../services/auth.service';
import { JobRole, jobRoleService } from '../../services/jobRoleService';
import Select from '../common/Select';
import MultiSelect from '../common/MultiSelect';
import Button from '../common/Button';

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
  
  // MultiSelect handles job role changes; no native select handler needed

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
        <Select
          value={formData.parentDepartment || undefined}
          onChange={(val) =>
            setFormData(prev => ({ ...prev, parentDepartment: val && val.length > 0 ? val : null }))
          }
          allowEmpty
          placeholder="No parent (top-level department)"
          className="w-full"
          searchable
          options={getAvailableParents().map(dept => ({ label: dept.title, value: String(dept.id) }))}
        />
        <p className="mt-1 text-sm text-gray-500">
          Select a parent department or leave empty for a top-level department
        </p>
      </div>

      <div>
        <label htmlFor="approvalRole" className="block text-sm font-medium text-gray-700 mb-1">
          Approval Role *
        </label>
        <Select
          value={formData.approvalRole || UserRole.DIRECTOR}
          onChange={(val) => setFormData(prev => ({ ...prev, approvalRole: (val as UserRole) || UserRole.DIRECTOR }))}
          options={[
            { label: 'Admin', value: UserRole.ADMIN },
            { label: 'Director', value: UserRole.DIRECTOR },
            { label: 'Manager', value: UserRole.MANAGER },
          ]}
          className="w-full"
        />
        <p className="mt-1 text-sm text-gray-500">
          Select the role required to approve jobs for this department
        </p>
      </div>

      <div>
        <label htmlFor="jobRoles" className="block text-sm font-medium text-gray-700 mb-1">
          Job Roles
        </label>
        <MultiSelect
          values={formData.jobRoles || []}
          onChange={(vals) => setFormData(prev => ({ ...prev, jobRoles: vals }))}
          options={jobRoles.map(role => ({ label: `${role.title} (${role.jobFunction.title})`, value: role._id }))}
          disabled={isSubmitting || loadingJobRoles}
          searchable
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" onClick={onCancel} disabled={isSubmitting} variant="white">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} variant="primary">
          {isSubmitting ? 'Saving...' : department ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm;
