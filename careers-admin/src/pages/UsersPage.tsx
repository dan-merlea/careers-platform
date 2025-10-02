import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, User, authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { departmentService, Department } from '../services/departmentService';
import ScrollableTable from '../components/common/ScrollableTable';

// User interface is now imported from auth.service.ts

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState<boolean>(false);
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const { token, userRole, impersonateUser } = useAuth();
  
  // Only admins should be able to access this page
  const isAdmin = userRole === 'admin';

  // Create memoized fetchUsers function to avoid dependency warnings
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const fetchedUsers = await authService.getAllUsers(token);
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  // Create memoized fetchDepartments function
  const fetchDepartments = useCallback(async () => {
    if (!token) return;
    
    try {
      const fetchedDepartments = await departmentService.getAll();
      setDepartments(fetchedDepartments);
    } catch (err) {
      console.error('Error fetching departments:', err);
      // We don't set an error here as it's not critical for the page to function
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const updatedUser = await authService.updateUserRole(userId, newRole, token);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? updatedUser : user
        )
      );
      
      setEditingUser(null);
      setError(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserDepartment = async (userId: string, departmentId: string | null) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const updatedUser = await authService.updateUserDepartment(userId, departmentId, token);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? updatedUser : user
        )
      );
      
      setEditingUser(null);
      setError(null);
    } catch (err) {
      console.error('Error updating user department:', err);
      setError('Failed to update user department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole(userId, newRole);
  };
  
  const handleDepartmentChange = (userId: string, departmentId: string | null | undefined) => {
    // Convert undefined to null for the API call
    updateUserDepartment(userId, departmentId || null);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'director':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'recruiter':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Users</h2>
          <p className="text-gray-600 mb-6">
            Manage user roles and permissions for the careers platform.
          </p>

          {loading && !users.length ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm text-gray-600">Loading users...</p>
            </div>
          ) : (
            <ScrollableTable>
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leader of
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.departmentId ? (
                          departments.find(dept => dept.id === user.departmentId || dept._id === user.departmentId)?.title || 'Unknown Department'
                        ) : (
                          (user.role === 'director' || user.role === 'manager') ? 'Not assigned' : 'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingUser?.id === user.id ? (
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-2">
                              <select
                                className="block w-28 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                              >
                                <option value="admin">Admin</option>
                                <option value="director">Director</option>
                                <option value="manager">Manager</option>
                                <option value="recruiter">Recruiter</option>
                                <option value="user">User</option>
                              </select>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => handleRoleChange(user.id, editingUser.role)}
                              >
                                Save Role
                              </button>
                            </div>
                            
                            {['director', 'manager', 'admin'].includes(editingUser.role) && isAdmin && (
                              <div className="flex items-center space-x-2">
                                <select
                                  className="block w-28 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                  value={editingUser.departmentId || ''}
                                  onChange={(e) => setEditingUser({ ...editingUser, departmentId: e.target.value || undefined })}
                                >
                                  <option value="">No Department</option>
                                  {departments.map(dept => (
                                    <option key={dept.id || dept._id} value={dept.id || dept._id}>{dept.title}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  onClick={() => handleDepartmentChange(user.id, editingUser.departmentId || null)}
                                >
                                  Save Dept
                                </button>
                              </div>
                            )}
                            
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => setEditingUser(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="relative inline-block text-left">
                            {isAdmin ? (
                              <>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  aria-haspopup="true"
                                  aria-expanded={openMenuUserId === user.id}
                                  onClick={() =>
                                    setOpenMenuUserId((prev) => (prev === user.id ? null : user.id))
                                  }
                                >
                                  <svg
                                    className="w-5 h-5 text-gray-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path d="M7.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                  </svg>
                                </button>

                                {openMenuUserId === user.id && (
                                  <div
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                    role="menu"
                                    aria-orientation="vertical"
                                  >
                                    <div className="py-1 flex flex-col" role="none">
                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        role="menuitem"
                                        onClick={() => {
                                          setEditingUser(user);
                                          setOpenMenuUserId(null);
                                        }}
                                      >
                                        Edit User
                                      </button>

                                      {(user.role === 'director' || user.role === 'manager') && (
                                        <button
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                          role="menuitem"
                                          onClick={() => {
                                            setEditingUser({
                                              ...user,
                                              departmentId: user.departmentId || undefined,
                                            });
                                            setOpenMenuUserId(null);
                                          }}
                                        >
                                          Edit Department
                                        </button>
                                      )}

                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        role="menuitem"
                                        disabled={impersonating}
                                        onClick={async () => {
                                          try {
                                            setImpersonating(true);
                                            setOpenMenuUserId(null);
                                            await impersonateUser(user.id);
                                            // The page will reload with the new user context
                                          } catch (error) {
                                            console.error('Error impersonating user:', error);
                                            setImpersonating(false);
                                            alert('Failed to impersonate user. Please try again.');
                                          }
                                        }}
                                      >
                                        {impersonating ? 'Signing in…' : 'Sign in as'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500">View Only</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
            </ScrollableTable>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
