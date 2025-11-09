import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PromptActivityChartProps {
  data: Array<{ date: string; count: number }>;
  loading?: boolean;
}

const PromptActivityChart: React.FC<PromptActivityChartProps> = React.memo(({ data, loading = false }) => {
  // Memoize formatted data to avoid recalculation on every render
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        <Bar 
          dataKey="count" 
          fill="#2563eb" 
          radius={[8, 8, 0, 0]}
          name="Prompts"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

PromptActivityChart.displayName = 'PromptActivityChart';

export default PromptActivityChart;
