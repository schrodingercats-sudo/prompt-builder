import React from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  height?: number;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  error,
  height = 300,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      
      <div style={{ minHeight: `${height}px` }} className="relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
            <div className="text-center px-4">
              <p className="text-red-600 font-medium">Failed to load chart</p>
              <p className="text-sm text-red-500 mt-1">{error}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartContainer;
