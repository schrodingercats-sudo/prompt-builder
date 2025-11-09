import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../services/authService';
import { databaseService } from '../../services/databaseService';
import { SubscriptionItem, PaymentItem } from '../../types';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ErrorFallback from './ErrorFallback';

interface AdminSubscriptionsProps {
  currentUser: AuthUser;
}

type SubscriptionFilter = 'all' | 'active' | 'cancelled' | 'expired';
type SortField = 'userEmail' | 'plan' | 'startDate' | 'expiryDate' | 'status';
type SortDirection = 'asc' | 'desc';

const AdminSubscriptions: React.FC<AdminSubscriptionsProps> = ({ currentUser }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionItem[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SubscriptionFilter>('all');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'reactivate' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Revenue metrics
  const [revenueMetrics, setRevenueMetrics] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    revenueGrowth: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [subscriptions, filter, sortField, sortDirection]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsData, paymentsData, metricsData] = await Promise.all([
        databaseService.getAllSubscriptions(),
        databaseService.getRecentPayments(20),
        databaseService.getRevenueMetrics()
      ]);
      
      setSubscriptions(subsData);
      setRecentPayments(paymentsData);
      setRevenueMetrics(metricsData);
    } catch (error) {
      console.error('Error loading subscriptions data:', error);
      showToast('Failed to load subscriptions data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...subscriptions];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(sub => {
        if (filter === 'expired') {
          return sub.expiryDate && new Date(sub.expiryDate) < new Date();
        }
        return sub.status === filter;
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'startDate' || sortField === 'expiryDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredSubscriptions(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      await databaseService.cancelSubscriptionAdmin(selectedSubscription.userId);
      showToast('Subscription cancelled successfully', 'success');
      setShowConfirmDialog(false);
      setSelectedSubscription(null);
      loadData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showToast('Failed to cancel subscription', 'error');
    }
  };

  const handleReactivateSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      await databaseService.reactivateSubscriptionAdmin(selectedSubscription.userId);
      showToast('Subscription reactivated successfully', 'success');
      setShowConfirmDialog(false);
      setSelectedSubscription(null);
      loadData();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      showToast('Failed to reactivate subscription', 'error');
    }
  };

  const openConfirmDialog = (subscription: SubscriptionItem, action: 'cancel' | 'reactivate') => {
    setSelectedSubscription(subscription);
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string, expiryDate: string | null) => {
    const isExpired = expiryDate && new Date(expiryDate) < new Date();
    
    if (isExpired) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          Expired
        </span>
      );
    }

    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            Active
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Subscriptions</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Subscriptions</h1>

      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(revenueMetrics.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(revenueMetrics.monthlyRevenue)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yearly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(revenueMetrics.yearlyRevenue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm touch-manipulation ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm touch-manipulation ${
              filter === 'active'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({subscriptions.filter(s => s.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm touch-manipulation ${
              filter === 'cancelled'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled ({subscriptions.filter(s => s.status === 'cancelled').length})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm touch-manipulation ${
              filter === 'expired'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expired ({subscriptions.filter(s => s.expiryDate && new Date(s.expiryDate) < new Date()).length})
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        {loading ? (
          <SkeletonLoader variant="table" count={10} />
        ) : filteredSubscriptions.length === 0 ? (
          <EmptyState
            title="No Subscriptions Found"
            message={filter !== 'all' ? "No subscriptions match your filter. Try selecting a different filter." : "No subscriptions have been created yet."}
            action={filter !== 'all' ? {
              label: "Clear Filter",
              onClick: () => setFilter('all')
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('userEmail')}
                  >
                    <div className="flex items-center gap-2">
                      User
                      <SortIcon field="userEmail" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('plan')}
                  >
                    <div className="flex items-center gap-2">
                      Plan
                      <SortIcon field="plan" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center gap-2">
                      Start Date
                      <SortIcon field="startDate" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('expiryDate')}
                  >
                    <div className="flex items-center gap-2">
                      Expiry Date
                      <SortIcon field="expiryDate" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.userEmail}
                        </div>
                        {subscription.displayName && (
                          <div className="text-sm text-gray-500">
                            {subscription.displayName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {subscription.paymentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.expiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subscription.status, subscription.expiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {subscription.status === 'active' ? (
                          <button
                            onClick={() => openConfirmDialog(subscription, 'cancel')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            onClick={() => openConfirmDialog(subscription, 'reactivate')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No recent payments
                  </td>
                </tr>
              ) : (
                recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === 'completed' ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {payment.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmAction === 'cancel' ? 'Cancel Subscription' : 'Reactivate Subscription'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction === 'cancel'
                ? `Are you sure you want to cancel the subscription for ${selectedSubscription.userEmail}?`
                : `Are you sure you want to reactivate the subscription for ${selectedSubscription.userEmail}? This will extend their access for 30 days.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedSubscription(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction === 'cancel' ? handleCancelSubscription : handleReactivateSubscription}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  confirmAction === 'cancel'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {confirmAction === 'cancel' ? 'Cancel Subscription' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
