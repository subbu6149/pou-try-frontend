import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Key, Search, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { User, Role, Permission } from '../types';
import { useAuthStore } from '../store/authStore';

interface UserFormData {
  full_name: string;
  phone: string;
  password: string;
  role_id: number | null;
  is_active: boolean;
  custom_permissions?: number[];
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [, setAllPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    phone: '',
    password: '',
    role_id: null,
    is_active: true,
    custom_permissions: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchAllPermissions();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const response = await api.get('/roles/permissions');
      setAllPermissions(response.data.permissions);
      setGroupedPermissions(response.data.grouped);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        full_name: user.full_name,
        phone: user.phone || '',
        password: '',
        role_id: user.role_id,
        is_active: user.is_active,
        custom_permissions: [],
      });
      setSelectedPermissions([]);
    } else {
      setEditingUser(null);
      setFormData({
        full_name: '',
        phone: '',
        password: '',
        role_id: null,
        is_active: true,
        custom_permissions: [],
      });
      setSelectedPermissions([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setSelectedPermissions([]);
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      custom_permissions: selectedPermissions,
    };

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, submitData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', submitData);
        toast.success('User created successfully');
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleResetPassword = async (id: number) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.post(`/users/${id}/reset-password`, { newPassword });
      toast.success('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and access control</p>
        </div>
        {hasPermission('USERS', 'EDIT') && (
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by phone or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell text-left font-semibold text-gray-700">Phone</th>
                <th className="table-cell text-left font-semibold text-gray-700">Full Name</th>
                <th className="table-cell text-left font-semibold text-gray-700">Role</th>
                <th className="table-cell text-left font-semibold text-gray-700">Status</th>
                <th className="table-cell text-left font-semibold text-gray-700">Last Login</th>
                <th className="table-cell text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-900">{user.phone || '-'}</td>
                  <td className="table-cell text-gray-900">{user.full_name}</td>
                  <td className="table-cell">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                      {user.role_name}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('USERS', 'EDIT') && (
                        <>
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Reset password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="input"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input"
                    placeholder="Enter phone number"
                    disabled={!!editingUser}
                  />
                  {!editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      This will be used as login ID
                    </p>
                  )}
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="input"
                      minLength={6}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role_id || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, role_id: parseInt(e.target.value) })
                    }
                    className="input"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editingUser && (
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active User</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Custom Permissions Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Custom Permissions (Optional)</h3>
                  <p className="text-xs text-gray-500">Override role permissions for this user</p>
                </div>
                
                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  {Object.entries(groupedPermissions).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Loading permissions...</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([module, perms]) => (
                        <div key={module} className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-bold text-sm text-primary-700 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {module}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {perms.map((perm) => (
                              <label
                                key={perm.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(perm.id)}
                                  onChange={() => handleTogglePermission(perm.id)}
                                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">{perm.action}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Selected permissions will be added to the user's role permissions. Leave empty to use only role permissions.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
