import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthUser } from '../../services/authService';
import { PromptLogItem } from '../../types';
import { databaseService } from '../../services/databaseService';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

interface AdminPromptsProps {
  currentUser: AuthUser;
}

type FilterModel = 'all' | 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash-exp';

const AdminPrompts: React.FC<AdminPromptsProps> = ({ currentUser }) => {
  const [prompts, setPrompts] = useState<PromptLogItem[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModel, setFilterModel] = useState<FilterModel>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptLogItem | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<PromptLogItem | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof PromptLogItem>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const promptsPerPage = 50;

  // Load prompts
  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await databaseService.getAllPrompts(1000, 0);
      setPrompts(data);
    } catch (error) {
      console.error('Error loading prompts:', error);
      showNotification('error', 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Memoize filtered and sorted prompts to avoid unnecessary recalculations
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = [...prompts];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(prompt => 
        prompt.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by model
    if (filterModel !== 'all') {
      filtered = filtered.filter(prompt => prompt.modelUsed === filterModel);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(prompt => new Date(prompt.createdAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000; // End of day
      filtered = filtered.filter(prompt => new Date(prompt.createdAt).getTime() < end);
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
      
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDirection === 'asc' 
          ? (aVal === bVal ? 0 : aVal ? 1 : -1)
          : (aVal === bVal ? 0 : aVal ? -1 : 1);
      }
      
      return 0;
    });

    return filtered;
  }, [prompts, searchQuery, filterModel, startDate, endDate, sortColumn, sortDirection]);

  // Update filteredPrompts when memoized value changes
  useEffect(() => {
    setFilteredPrompts(filteredAndSortedPrompts);
    setCurrentPage(1);
  }, [filteredAndSortedPrompts]);

  // Memoize pagination values
  const totalPages = useMemo(() => Math.ceil(filteredPrompts.length / promptsPerPage), [filteredPrompts.length, promptsPerPage]);
  const startIndex = (currentPage - 1) * promptsPerPage;
  const endIndex = startIndex + promptsPerPage;
  const currentPrompts = filteredPrompts.slice(startIndex, endIndex);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // View prompt details
  const handleViewPrompt = (prompt: PromptLogItem) => {
    setSelectedPrompt(prompt);
    setShowPromptModal(true);
  };

  // Delete prompt
  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    try {
      await databaseService.deletePromptAdmin(promptToDelete.id);
      showNotification('success', 'Prompt deleted successfully');
      setShowDeleteConfirm(false);
      setPromptToDelete(null);
      setShowPromptModal(false);
      loadPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      showNotification('error', 'Failed to delete prompt');
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (prompt: PromptLogItem) => {
    try {
      await databaseService.togglePromptVisibility(prompt.id);
      showNotification('success', `Prompt ${prompt.isPublic ? 'hidden' : 'made public'} successfully`);
      loadPrompts();
      if (selectedPrompt?.id === prompt.id) {
        setSelectedPrompt({ ...prompt, isPublic: !prompt.isPublic });
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showNotification('error', 'Failed to toggle visibility');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['User Email', 'Title', 'Model', 'Date', 'Visibility', 'Original Length', 'Optimized Length'];
    const rows = filteredPrompts.map(prompt => [
      prompt.userEmail,
      prompt.title,
      prompt.modelUsed,
      new Date(prompt.createdAt).toLocaleString(),
      prompt.isPublic ? 'Public' : 'Private',
      prompt.originalLength.toString(),
      prompt.optimizedLength.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prompts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('success', 'CSV exported successfully');
  };

  // Handle sort
  const handleSort = (column: keyof PromptLogItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Prompt Logs & Moderation</h1>
        <button
          onClick={handleExportCSV}
          disabled={filteredPrompts.length === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto touch-manipulation"
        >
          <svg className="h-4 md:h-5 w-4 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

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
          {/* First Row: Search and Model Filter */}
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by user email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Model Filter */}
            <div className="w-full">
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value as FilterModel)}
                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Models</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
              </select>
            </div>
          </div>

          {/* Second Row: Date Range */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {(startDate || endDate) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full md:w-auto px-4 py-2 text-xs md:text-sm text-gray-600 hover:text-gray-800 font-medium touch-manipulation"
                >
                  Clear Dates
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredPrompts.length)} of {filteredPrompts.length} prompts
        </div>
      </div>

      {/* Prompts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <SkeletonLoader variant="table" count={10} />
        ) : filteredPrompts.length === 0 ? (
          <EmptyState
            title="No Prompts Found"
            message={searchQuery ? "No prompts match your search criteria. Try adjusting your filters." : "No prompts have been created yet."}
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
                      onClick={() => handleSort('userEmail')}
                    >
                      User Email {sortColumn === 'userEmail' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      Title {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('modelUsed')}
                    >
                      Model {sortColumn === 'modelUsed' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      Date {sortColumn === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('isPublic')}
                    >
                      Visibility {sortColumn === 'isPublic' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPrompts.map((prompt) => (
                    <tr key={prompt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prompt.userEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {prompt.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {prompt.modelUsed}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          prompt.isPublic
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prompt.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewPrompt(prompt)}
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(prompt)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {prompt.isPublic ? 'Hide' : 'Show'}
                          </button>
                          <button
                            onClick={() => {
                              setPromptToDelete(prompt);
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
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Prompt Detail Modal */}
      {showPromptModal && selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Prompt Details</h2>
                <button
                  onClick={() => {
                    setShowPromptModal(false);
                    setSelectedPrompt(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">User Email</label>
                  <p className="text-gray-900">{selectedPrompt.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Title</label>
                  <p className="text-gray-900">{selectedPrompt.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Model Used</label>
                  <p className="text-gray-900">{selectedPrompt.modelUsed}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-gray-900">{new Date(selectedPrompt.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Visibility</label>
                  <p className="text-gray-900">{selectedPrompt.isPublic ? 'Public' : 'Private'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lengths</label>
                  <p className="text-gray-900">
                    Original: {selectedPrompt.originalLength} | Optimized: {selectedPrompt.optimizedLength}
                  </p>
                </div>
              </div>

              {/* Original Prompt */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Prompt</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPrompt.originalPrompt}</p>
                </div>
              </div>

              {/* Optimized Prompt */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimized Prompt</h3>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPrompt.optimizedPrompt}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleToggleVisibility(selectedPrompt)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {selectedPrompt.isPublic ? 'Make Private' : 'Make Public'}
                </button>
                <button
                  onClick={() => {
                    setPromptToDelete(selectedPrompt);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && promptToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Prompt</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the prompt "<strong>{promptToDelete.title}</strong>" by {promptToDelete.userEmail}? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPromptToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePrompt}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrompts;
