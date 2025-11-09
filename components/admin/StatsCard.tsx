import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon?: React.ReactNode;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = React.memo(({ 
  title, 
  value, 
  subtitle, 
  growth,
  icon,
  loading = false 
}) => {
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↑';
    if (growth < 0) return '↓';
    return '→';
  };

  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      role="article"
      aria-label={`${title} statistics`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {loading ? (
            <div className="mt-2 h-8 w-24 bg-gray-200 animate-pulse rounded" role="status" aria-label="Loading"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-2" aria-live="polite">{value}</p>
          )}
          {!loading && growth !== undefined && (
            <p className={`text-sm font-medium mt-2 flex items-center gap-1 ${getGrowthColor(growth)}`}>
              <span aria-hidden="true">{getGrowthIcon(growth)}</span>
              <span>{Math.abs(growth)}%</span>
              <span className="text-gray-500 font-normal">vs last period</span>
            </p>
          )}
          {!loading && subtitle && !growth && (
            <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-purple-50 rounded-lg" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
