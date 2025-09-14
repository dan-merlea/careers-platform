import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId: string;
}

interface Department {
  id: string;
  name: string;
}

const DebugUserManagement: React.FC = () => {
  const { companyId } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    departmentId: '',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');

  useEffect(() => {
    // Fetch departments when component mounts
    const fetchDepartments = async () => {
      try {
        const departmentsData = await api.get<Department[]>('/company/departments');
        setDepartments(departmentsData);
      } catch (err: any) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const generateRandomPassword = () => {
    // Generate a random password with letters, numbers, and special characters
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    
    // Ensure at least one of each character type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setGeneratedPassword(password);
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      // Generate a random password if one hasn't been generated yet
      const password = generatedPassword || generateRandomPassword();
      
      // Create user with the generated password
      const userData = {
        ...formData,
        password,
        // Add name field by combining firstName and lastName
        name: `${formData.firstName} ${formData.lastName}`,
        // Set departmentId to null if empty string
        departmentId: formData.departmentId || null,
      };

      if (!companyId) {
        throw new Error('Company ID is required. Please make sure you are logged in with a company account.');
      }

      // Make API call to create user with company ID
      const endpoint = `/users/signup?companyId=${companyId}`;
      const response = await api.post(endpoint, userData);
      setResponse(response);
      
      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        departmentId: '',
      });
      
      // Keep the generated password visible so the admin can share it
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This is a debug form only available in development mode. It allows you to add users to the company with randomly generated passwords.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">Debug User Management</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
              First Name *
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
              Last Name *
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email *
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role *
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="user">User</option>
              <option value="recruiter">Recruiter</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="departmentId">
              Department
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4 col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <div className="flex items-center">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={generatedPassword}
                readOnly
                placeholder="Password will be generated automatically"
              />
              <button
                type="button"
                onClick={() => generateRandomPassword()}
                className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">A random password will be generated when you submit the form if you don't generate one manually.</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {response && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">User created successfully.</span>
          <div className="mt-2">
            <h3 className="font-bold">User Details:</h3>
            <pre className="bg-gray-100 p-2 mt-2 rounded overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-bold">Important:</p>
              <p>The password for this user is: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{generatedPassword}</span></p>
              <p className="text-sm text-gray-600 mt-1">Make sure to copy this password and share it with the user. It won't be displayed again.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugUserManagement;
