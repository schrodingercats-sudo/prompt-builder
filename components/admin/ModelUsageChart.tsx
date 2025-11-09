import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ModelUsageChartProps {
  data: Array<{ name: string; value: number }>;
  loading?: boolean;
}

const COLORS = ['#9333ea', '#2563eb', '#16a34a', '#ea580c', '#eab308', '#ec4899'];

const ModelUsageChart: React.FC<ModelUsageChartProps> = React.memo(({ data, loading = false }) => {
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
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

ModelUsageChart.displayName = 'ModelUsageChart';

export default ModelUsageChart;
