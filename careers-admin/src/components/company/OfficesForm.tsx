import React from 'react';
import { useForm } from 'react-hook-form';
import { Office, CreateOfficeDto, UpdateOfficeDto } from '../../services/officesService';

interface OfficesFormProps {
  office?: Office;
  onSubmit: (data: CreateOfficeDto | UpdateOfficeDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const OfficesForm: React.FC<OfficesFormProps> = ({
  office,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateOfficeDto>({
    defaultValues: office ? {
      name: office.name,
      address: office.address
    } : {
      name: '',
      address: ''
    }
  });

  const isEditing = !!office;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Office' : 'Add New Office'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Office Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Office name is required' })}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter office name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            {...register('address', { required: 'Address is required' })}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter office address"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Office' : 'Add Office'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfficesForm;
