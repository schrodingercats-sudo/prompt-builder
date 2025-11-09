import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../services/authService';
import { databaseService } from '../../services/databaseService';
import StatsCard from './StatsCard';
import UserGrowthChart from './UserGrowthChart';
import PromptTrendsChart from './PromptTrendsChart';
import ModelDistributionChart from './ModelDistributionChart';
import RevenueChart from './RevenueChart';
import TopUsersList from './TopUsersList';
import SkeletonLoader from './SkeletonLoader';
import ErrorFallback from './ErrorFallback';
import RetryButton from './RetryButton';

interface AdminAnalyticsProps {
  currentUser: AuthUser;
}

interface AnalyticsMetrics {
  totalRevenue: number;
  mrr: number;
  arpu: number;
  conversionRate: number;
  churnRate: number;
}

interface TopUser {
  id: string;
  email: string;
  displayName?: string;
  promptCount: number;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ currentUser }) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<Array<{ date: string; count: number }>>([]);
  const [promptTrendsData, setPromptTrendsData] = useState<Array<{ date: string; count: number }>>([]);
  const [modelDistributionData, setModelDistributionData] = useState<Array<{ name: string; value: number }>>([]);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [topUsersLoading, setTopUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setError(null);
      
      // Load metrics
      setMetricsLoading(true);
      const metricsData = await databaseService.getAnalyticsMetrics();
      setMetrics(metricsData);
      setMetricsLoading(false);

      // Load chart data
      setChartsLoading(true);
      const [userGrowth, promptTrends, modelDistribution, revenue] = await Promise.all([
        databaseService.getUserGrowthData(90),
        databaseService.getPromptActivityData(90),
        databaseService.getModelUsageData(),
        databaseService.getRevenueData(12)
      ]);
      setUserGrowthData(userGrowth);
      setPromptTrendsData(promptTrends);
      setModelDistributionData(modelDistribution);
      setRevenueData(revenue);
      setChartsLoading(false);

      // Load top users
      setTopUsersLoading(true);
      const topUsersData = await databaseService.getTopUsers(10);
      setTopUsers(topUsersData);
      setTopUsersLoading(false);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
      setMetricsLoading(false);
      setChartsLoading(false);
      setTopUsersLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1>
        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base w-full sm:w-auto touch-manipulation"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorFallback
            error={new Error(error)}
            onReset={loadAnalyticsData}
            title="Failed to Load Analytics"
            message="We couldn't load the analytics data. Please try again."
          />
        </div>
      )}

      {/* Metrics Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          subtitle="All time"
          icon={
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={metricsLoading}
        />

        <StatsCard
          title="MRR"
          value={formatCurrency(metrics?.mrr || 0)}
          subtitle="Monthly recurring"
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          loading={metricsLoading}
        />

        <StatsCard
          title="ARPU"
          value={formatCurrency(metrics?.arpu || 0)}
          subtitle="Avg per user"
          icon={
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          loading={metricsLoading}
        />

        <StatsCard
          title="Conversion Rate"
          value={`${metrics?.conversionRate || 0}%`}
          subtitle="Free to Pro"
          icon={
            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={metricsLoading}
        />

        <StatsCard
          title="Churn Rate"
          value={`${metrics?.churnRate || 0}%`}
          subtitle="Cancellations"
          icon={
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
          loading={metricsLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {chartsLoading ? (
          <>
            <SkeletonLoader variant="chart" />
            <SkeletonLoader variant="chart" />
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">User Growth (Last 90 Days)</h2>
              <UserGrowthChart data={userGrowthData} loading={chartsLoading} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Prompt Trends (Last 90 Days)</h2>
              <PromptTrendsChart data={promptTrendsData} loading={chartsLoading} />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {chartsLoading ? (
          <>
            <SkeletonLoader variant="chart" />
            <SkeletonLoader variant="chart" />
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">AI Model Distribution</h2>
              <ModelDistributionChart data={modelDistributionData} loading={chartsLoading} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends (Last 12 Months)</h2>
              <RevenueChart data={revenueData} loading={chartsLoading} />
            </div>
          </>
        )}
      </div>

      {/* Top Users Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Users by Prompt Count</h2>
        <TopUsersList users={topUsers} loading={topUsersLoading} />
      </div>
    </div>
  );
};

export default AdminAnalytics;
