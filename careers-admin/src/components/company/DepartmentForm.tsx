import React, { useState, useEffect } from 'react';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../../services/departmentService';

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
    name: '',
    description: '',
    parentDepartment: null
  });

  // Initialize form with department data if provided (edit mode)
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        description: department.description || '',
        parentDepartment: department.parentDepartment || null
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Filter out the current department and its children from parent options to prevent circular references
  const getAvailableParents = () => {
    if (!department || !department._id) {
      return departments;
    }
    
    // Helper function to check if a department is the current one or its descendant
    const isCurrentOrDescendant = (dept: Department): boolean => {
      if (dept._id === department._id) {
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Department Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Department name"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Department description (optional)"
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
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select a parent department or leave empty for a top-level department
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
