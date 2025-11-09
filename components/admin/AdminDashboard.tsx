import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../services/authService';
import { databaseService } from '../../services/databaseService';
import StatsCard from './StatsCard';
import UserGrowthChart from './UserGrowthChart';
import PromptActivityChart from './PromptActivityChart';
import ModelUsageChart from './ModelUsageChart';
import ActivityFeed from './ActivityFeed';
import SkeletonLoader from './SkeletonLoader';
import ErrorFallback from './ErrorFallback';
import RetryButton from './RetryButton';

interface AdminDashboardProps {
  currentUser: AuthUser;
}

interface AdminStats {
  totalUsers: number;
  totalPrompts: number;
  activeSubscriptions: number;
  totalRevenue: number;
  userGrowth: number;
  promptGrowth: number;
}

interface Activity {
  id: string;
  type: 'user_signup' | 'prompt_created' | 'subscription_change';
  description: string;
  timestamp: string;
  userEmail?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<Array<{ date: string; count: number }>>([]);
  const [promptActivityData, setPromptActivityData] = useState<Array<{ date: string; count: number }>>([]);
  const [modelUsageData, setModelUsageData] = useState<Array<{ name: string; value: number }>>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadChartData();
    loadRecentActivity();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await databaseService.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading admin stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      setChartsLoading(true);
      const [userGrowth, promptActivity, modelUsage] = await Promise.all([
        databaseService.getUserGrowthData(30),
        databaseService.getPromptActivityData(7),
        databaseService.getModelUsageData()
      ]);
      setUserGrowthData(userGrowth);
      setPromptActivityData(promptActivity);
      setModelUsageData(modelUsage);
    } catch (err) {
      console.error('Error loading chart data:', err);
    } finally {
      setChartsLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const activities = await databaseService.getRecentActivity();
      setRecentActivity(activities);
    } catch (err) {
      console.error('Error loading recent activity:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorFallback
            error={new Error(error)}
            onReset={loadStats}
            title="Failed to Load Dashboard"
            message="We couldn't load the dashboard data. Please try again."
          />
        </div>
      )}
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          growth={stats?.userGrowth}
          icon={
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          loading={loading}
        />

        <StatsCard
          title="Total Prompts"
          value={stats?.totalPrompts || 0}
          growth={stats?.promptGrowth}
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          loading={loading}
        />

        <StatsCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          subtitle={`${stats?.activeSubscriptions || 0} pro users`}
          icon={
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          loading={loading}
        />

        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle="All time"
          icon={
            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {chartsLoading ? (
          <>
            <SkeletonLoader variant="chart" />
            <SkeletonLoader variant="chart" />
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">User Growth (Last 30 Days)</h2>
              <UserGrowthChart data={userGrowthData} loading={chartsLoading} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Prompt Activity (Last 7 Days)</h2>
              <PromptActivityChart data={promptActivityData} loading={chartsLoading} />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {chartsLoading ? (
          <>
            <SkeletonLoader variant="chart" />
            <SkeletonLoader variant="card" />
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">AI Model Usage</h2>
              <ModelUsageChart data={modelUsageData} loading={chartsLoading} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Average Prompts per User</span>
                  <span className="font-bold text-gray-900">
                    {stats && stats.totalUsers > 0 
                      ? (stats.totalPrompts / stats.totalUsers).toFixed(1)
                      : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-bold text-gray-900">
                    {stats && stats.totalUsers > 0 
                      ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Free Users</span>
                  <span className="font-bold text-gray-900">
                    {stats ? stats.totalUsers - stats.activeSubscriptions : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pro Users</span>
                  <span className="font-bold text-purple-600">
                    {stats?.activeSubscriptions || 0}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <ActivityFeed activities={recentActivity} loading={activityLoading} />
      </div>
    </div>
  );
};

export default AdminDashboard;
