import React, { useState, useEffect } from 'react';
import { JobFunction, CreateJobFunctionDto, UpdateJobFunctionDto } from '../../services/jobFunctionService';

interface JobFunctionFormProps {
  jobFunction?: JobFunction;
  onSubmit: (data: CreateJobFunctionDto | UpdateJobFunctionDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  companyId: string;
}

const JobFunctionForm: React.FC<JobFunctionFormProps> = ({
  jobFunction,
  onSubmit,
  onCancel,
  isSubmitting,
  companyId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    if (jobFunction) {
      setName(jobFunction.title || '');
      setDescription(jobFunction.description || '');
    }
  }, [jobFunction]);

  const validate = (): boolean => {
    const newErrors: { name?: string; description?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const formData: CreateJobFunctionDto | UpdateJobFunctionDto = {
      title: name.trim(),
      description: description.trim() || undefined,
      company: companyId
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {jobFunction ? 'Edit Job Function' : 'Add Job Function'}
      </h2>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default JobFunctionForm;
