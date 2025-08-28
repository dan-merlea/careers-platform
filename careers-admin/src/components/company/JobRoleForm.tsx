import React, { useState, useEffect } from 'react';
import { JobRole, CreateJobRoleDto, UpdateJobRoleDto } from '../../services/jobRoleService';
import { JobFunction } from '../../services/jobFunctionService';

interface JobRoleFormProps {
  jobRole?: JobRole;
  jobFunctions: JobFunction[];
  onSubmit: (data: CreateJobRoleDto | UpdateJobRoleDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const JobRoleForm: React.FC<JobRoleFormProps> = ({
  jobRole,
  jobFunctions,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [title, setTitle] = useState('');
  const [jobFunction, setJobFunction] = useState<JobFunction | undefined>(undefined);
  const [errors, setErrors] = useState<{ title?: string; jobFunction?: string }>({});

  useEffect(() => {
    if (jobRole) {
      setTitle(jobRole.title || '');
      setJobFunction(jobRole.jobFunction || undefined);
    } else if (jobFunctions.length > 0) {
      // Default to first job function if creating new role
      setJobFunction(jobFunctions[0]);
    }
  }, [jobRole, jobFunctions]);

  const validate = (): boolean => {
    const newErrors: { title?: string; jobFunction?: string } = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!jobFunction) {
      newErrors.jobFunction = 'Job function is required';
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

    const formData: CreateJobRoleDto | UpdateJobRoleDto = {
      title: title.trim(),
      jobFunction: jobFunction ? jobFunction._id : ''
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {jobRole ? 'Edit Job Role' : 'Add Job Role'}
      </h2>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="jobFunction" className="block text-sm font-medium text-gray-700 mb-1">
          Job Function <span className="text-red-500">*</span>
        </label>
        <select
          id="jobFunction"
          value={jobFunction ? jobFunction._id : ''}
          onChange={(e) => {
            const selectedFunction = jobFunctions.find(jf => jf._id === e.target.value);
            setJobFunction(selectedFunction);
          }}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.jobFunction ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting || jobFunctions.length === 0}
        >
          {jobFunctions.length === 0 ? (
            <option value="">No job functions available</option>
          ) : (
            <>
              <option value="">Select a job function</option>
              {jobFunctions.map((jf) => (
                <option key={jf._id} value={jf._id}>
                  {jf.title}
                </option>
              ))}
            </>
          )}
        </select>
        {errors.jobFunction && <p className="mt-1 text-sm text-red-500">{errors.jobFunction}</p>}
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
          disabled={isSubmitting || jobFunctions.length === 0}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default JobRoleForm;
