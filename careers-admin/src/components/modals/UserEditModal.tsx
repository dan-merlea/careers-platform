import React, { useState, useEffect } from 'react';
import { User, UserRole, authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { Department } from '../../services/departmentService';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
  departments: Department[];
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
  isActive: boolean;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated,
  user,
  departments,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.USER,
    departmentId: null,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      // Parse name into first and last name
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId || null,
        isActive: user.isActive !== false,
      });
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Update role if changed
      if (formData.role !== user.role) {
        await authService.updateUserRole(user.id, formData.role, token);
      }

      // Update department if changed (for director/manager/admin roles)
      if (['director', 'manager', 'admin'].includes(formData.role)) {
        if (formData.departmentId !== user.departmentId) {
          await authService.updateUserDepartment(user.id, formData.departmentId, token);
        }
      }

      // Update status if changed
      const currentStatus = user.isActive !== false;
      if (formData.isActive !== currentStatus) {
        await authService.updateUserStatus(user.id, formData.isActive, token);
      }

      onUserUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  const showDepartmentField = [UserRole.DIRECTOR, UserRole.MANAGER, UserRole.ADMIN].includes(formData.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
                  Role *
                </label>
                <Select
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: (val as UserRole) || UserRole.USER })}
                  options={[
                    { label: 'User', value: UserRole.USER },
                    { label: 'Recruiter', value: UserRole.RECRUITER },
                    { label: 'Manager', value: UserRole.MANAGER },
                    { label: 'Director', value: UserRole.DIRECTOR },
                    { label: 'Admin', value: UserRole.ADMIN },
                  ]}
                  popUpward
                />
              </div>

              {showDepartmentField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="departmentId">
                    Department
                  </label>
                  <Select
                    value={formData.departmentId || undefined}
                    onChange={(val) => setFormData({ ...formData, departmentId: val || null })}
                    options={departments.map((dept) => ({
                      label: dept.title,
                      value: (dept.id || dept._id) as string,
                    }))}
                    placeholder="-- No Department --"
                    allowEmpty
                    popUpward
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active User
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inactive users cannot log in to the platform
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
