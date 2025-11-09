import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthUser } from '../../services/authService';
import { UserListItem } from '../../types';
import { databaseService } from '../../services/databaseService';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

interface AdminUsersProps {
  currentUser: AuthUser;
}

type FilterStatus = 'all' | 'free' | 'pro' | 'cancelled';

const AdminUsers: React.FC<AdminUsersProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
  const [userToReset, setUserToReset] = useState<UserListItem | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<keyof UserListItem>('signupDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const usersPerPage = 50;

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await databaseService.getAllUsers(1000, 0); // Load more for client-side filtering
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Memoize filtered and sorted users to avoid unnecessary recalculations
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter (if searchQuery is empty, use all users)
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by subscription status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filterStatus === 'pro') {
          return user.subscriptionStatus === 'active' || user.subscriptionStatus === 'pro';
        }
        return user.subscriptionStatus === filterStatus;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    return filtered;
  }, [users, searchQuery, filterStatus, sortColumn, sortDirection]);

  // Update filteredUsers when memoized value changes
  useEffect(() => {
    setFilteredUsers(filteredAndSortedUsers);
    setCurrentPage(1);
  }, [filteredAndSortedUsers]);

  // Memoize pagination values
  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / usersPerPage), [filteredUsers.length, usersPerPage]);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // View user details
  const handleViewUser = async (user: UserListItem) => {
    setSelectedUser(user);
    setShowUserModal(true);
    
    try {
      const stats = await databaseService.getUserStats(user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Reset user credits
  const handleResetCredits = async () => {
    if (!userToReset) return;

    try {
      await databaseService.resetUserCredits(userToReset.id);
      showNotification('success', 'Credits reset successfully');
      setShowResetConfirm(false);
      setUserToReset(null);
      loadUsers();
    } catch (error) {
      console.error('Error resetting credits:', error);
      showNotification('error', 'Failed to reset credits');
    }
  };

  // Delete user account
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await databaseService.deleteUserAccount(userToDelete.id);
      showNotification('success', 'User deleted successfully');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setShowUserModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('error', 'Failed to delete user');
    }
  };

  // Handle sort
  const handleSort = (column: keyof UserListItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">User Management</h1>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <SkeletonLoader variant="table" count={10} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users Found"
            message={searchQuery ? "No users match your search criteria. Try adjusting your filters." : "No users have signed up yet."}
            action={searchQuery ? {
              label: "Clear Search",
              onClick: () => setSearchQuery('')
            } : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      Email {sortColumn === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('signupDate')}
                    >
                      Signup Date {sortColumn === 'signupDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('subscriptionStatus')}
                    >
                      Subscription {sortColumn === 'subscriptionStatus' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('credits')}
                    >
                      Credits {sortColumn === 'credits' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('emailVerified')}
                    >
                      Verified {sortColumn === 'emailVerified' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalPrompts')}
                    >
                      Prompts {sortColumn === 'totalPrompts' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.signupDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.subscriptionStatus === 'active' || user.subscriptionStatus === 'pro'
                            ? 'bg-green-100 text-green-800'
                            : user.subscriptionStatus === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscriptionStatus || 'free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.emailVerified ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.totalPrompts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setUserToReset(user);
                              setShowResetConfirm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  Previous
                </button>
                <span className="text-xs md:text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                    setUserStats(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {/* User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Display Name</label>
                  <p className="text-gray-900">{selectedUser.displayName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Signup Date</label>
                  <p className="text-gray-900">{new Date(selectedUser.signupDate).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Subscription</label>
                  <p className="text-gray-900">{selectedUser.subscriptionStatus || 'free'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Credits</label>
                  <p className="text-gray-900">{selectedUser.credits}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email Verified</label>
                  <p className="text-gray-900">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* User Stats */}
              {userStats && (
                <div className="mb-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Prompts</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.totalPrompts}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Public Prompts</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.publicPrompts}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Private Prompts</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.privatePrompts}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Prompts */}
              {userStats && userStats.recentPrompts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prompts</h3>
                  <div className="space-y-3">
                    {userStats.recentPrompts.slice(0, 5).map((prompt: any) => (
                      <div key={prompt.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{prompt.title}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(prompt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{prompt.optimized_prompt}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {prompt.model_used}
                          </span>
                          {prompt.is_public && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Public
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setUserToReset(selectedUser);
                    setShowResetConfirm(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm md:text-base touch-manipulation"
                >
                  Reset Credits
                </button>
                <button
                  onClick={() => {
                    setUserToDelete(selectedUser);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm md:text-base touch-manipulation"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Credits Confirmation */}
      {showResetConfirm && userToReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reset Credits</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset credits for <strong>{userToReset.email}</strong>? 
              This will set their credits to 2 and clear any reset timer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setUserToReset(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCredits}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Reset Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{userToDelete.email}</strong>? 
              This will permanently delete their account, all prompts, and credits. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
