import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PromptTrendsChartProps {
  data: Array<{ date: string; count: number }>;
  loading?: boolean;
}

const PromptTrendsChart: React.FC<PromptTrendsChartProps> = React.memo(({ data, loading = false }) => {
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
      <AreaChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorPrompts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="displayDate" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          interval="preserveStartEnd"
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
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#2563eb" 
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPrompts)"
          name="Prompts Optimized"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

PromptTrendsChart.displayName = 'PromptTrendsChart';

export default PromptTrendsChart;
