import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserGrowthChartProps {
  data: Array<{ date: string; count: number }>;
  loading?: boolean;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = React.memo(({ data, loading = false }) => {
  // Memoize formatted data to avoid recalculation on every render
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data]);

  // Memoize summary statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { totalUsers: 0, avgUsers: 0, maxUsers: 0 };
    const totalUsers = data.reduce((sum, item) => sum + item.count, 0);
    const avgUsers = Math.round(totalUsers / data.length);
    const maxUsers = Math.max(...data.map(item => item.count));
    return { totalUsers, avgUsers, maxUsers };
  }, [data]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center" role="status" aria-live="polite">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400" role="status">
        No data available
      </div>
    );
  }

  return (
    <div role="img" aria-label={`User growth chart showing ${stats.totalUsers} total new users over ${data.length} days, with an average of ${stats.avgUsers} users per day and a peak of ${stats.maxUsers} users`}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="displayDate" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#9333ea" 
            strokeWidth={2}
            dot={{ fill: '#9333ea', r: 4 }}
            activeDot={{ r: 6 }}
            name="New Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

UserGrowthChart.displayName = 'UserGrowthChart';

export default UserGrowthChart;
