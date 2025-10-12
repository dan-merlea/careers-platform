import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, User, authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { departmentService, Department } from '../services/departmentService';
import ScrollableTable from '../components/common/ScrollableTable';
import ActionsMenu, { ActionsMenuItem } from '../components/common/ActionsMenu';
import { PencilIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import UserCreateModal from '../components/modals/UserCreateModal';
import UserEditModal from '../components/modals/UserEditModal';

// User interface is now imported from auth.service.ts

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.DIRECTOR:
        return 'bg-purple-100 text-purple-800';
      case UserRole.MANAGER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.RECRUITER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        {isAdmin && (
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            Create User
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <Card>
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
                        <div className="relative inline-block text-left">
                          {isAdmin ? (
                            <ActionsMenu
                              buttonAriaLabel="User actions"
                              align="right"
                              menuWidthPx={224}
                              items={(() => {
                                const items: ActionsMenuItem[] = [
                                  { label: 'Edit User', onClick: () => handleEditUser(user), icon: <PencilIcon className="w-4 h-4" /> },
                                ];
                                items.push({
                                  label: impersonating ? 'Signing in…' : 'Sign in as',
                                  onClick: async () => {
                                    try {
                                      setImpersonating(true);
                                      await impersonateUser(user.id);
                                    } catch (error) {
                                      console.error('Error impersonating user:', error);
                                      setImpersonating(false);
                                      alert('Failed to impersonate user. Please try again.');
                                    }
                                  },
                                  icon: <ArrowRightOnRectangleIcon className="w-4 h-4" />,
                                  disabled: impersonating,
                                });
                                
                                return items;
                              })()}
                            />
                          ) : (
                            <span className="text-gray-500">View Only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </ScrollableTable>
        )}
      </Card>

      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={fetchUsers}
        departments={departments}
      />

      <UserEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onUserUpdated={fetchUsers}
        user={editingUser}
        departments={departments}
      />
    </div>
  );
};

export default UsersPage;
