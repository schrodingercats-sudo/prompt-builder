import React, { useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
  loading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = React.memo(({ data, loading = false }) => {
  // Memoize currency formatter to avoid recreation
  const formatCurrency = useCallback((value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  }, []);

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          labelStyle={{ color: '#374151', fontWeight: 'bold' }}
          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
        />
        <Bar 
          dataKey="revenue" 
          fill="#16a34a" 
          radius={[8, 8, 0, 0]}
          name="Revenue"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

RevenueChart.displayName = 'RevenueChart';

export default RevenueChart;
