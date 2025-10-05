import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Department } from '../../services/departmentService';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  departments: Department[];
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId: string;
  skipPassword: boolean;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  departments,
}) => {
  const { companyId } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    departmentId: '',
    skipPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        departmentId: '',
        skipPassword: false,
      });
      setGeneratedPassword('');
      setError(null);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)];
    
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setGeneratedPassword(password);
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);

    try {
      const userData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        name: `${formData.firstName} ${formData.lastName}`,
        departmentId: formData.departmentId || null,
      };

      // Only add password if not skipping
      if (!formData.skipPassword) {
        const password = generatedPassword || generateRandomPassword();
        userData.password = password;
      }

      if (!companyId) {
        throw new Error('Company ID is required. Please make sure you are logged in with a company account.');
      }

      const endpoint = `/users/signup?companyId=${companyId}`;
      await api.post(endpoint, userData);
      
      setShowSuccess(true);
      
      // Close modal after 2 seconds and refresh user list
      setTimeout(() => {
        onUserCreated();
        onClose();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
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

          {showSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
              <p className="font-bold">Success!</p>
              <p>User created successfully.</p>
              {!formData.skipPassword && generatedPassword && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-bold text-yellow-800">Important - Save this password:</p>
                  <p className="font-mono bg-white px-2 py-1 rounded mt-1 text-sm">{generatedPassword}</p>
                  <p className="text-xs text-yellow-700 mt-1">Make sure to copy this password and share it with the user. It won't be displayed again.</p>
                </div>
              )}
            </div>
          ) : (
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
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
                    Role *
                  </label>
                  <Select
                    value={formData.role}
                    onChange={(val) => setFormData({ ...formData, role: val || 'user' })}
                    options={[
                      { label: 'User', value: 'user' },
                      { label: 'Recruiter', value: 'recruiter' },
                      { label: 'Manager', value: 'manager' },
                      { label: 'Director', value: 'director' },
                      { label: 'Admin', value: 'admin' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="departmentId">
                    Department
                  </label>
                  <Select
                    value={formData.departmentId}
                    onChange={(val) => setFormData({ ...formData, departmentId: val || '' })}
                    options={departments.map((dept) => ({
                      label: dept.title,
                      value: (dept.id || dept._id) as string,
                    }))}
                    placeholder="-- Select Department --"
                    allowEmpty
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="skipPassword"
                      name="skipPassword"
                      checked={formData.skipPassword}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="skipPassword" className="ml-2 block text-sm text-gray-700">
                      Skip password (for Google or Okta sign-in)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Skip password if the company is using Google or Okta sign-in. The user will authenticate through SSO.
                  </p>

                  {!formData.skipPassword && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={generatedPassword}
                          readOnly
                          placeholder="Password will be generated automatically"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => generateRandomPassword()}
                          variant="secondary"
                        >
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        A random password will be generated when you submit the form if you don't generate one manually.
                      </p>
                    </>
                  )}
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
                  {isSubmitting ? 'Creating User...' : 'Create User'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCreateModal;
