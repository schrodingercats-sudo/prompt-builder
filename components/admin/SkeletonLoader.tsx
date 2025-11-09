import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'chart' | 'list' | 'text';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text', 
  count = 1,
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse ${className}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse ${className}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200 flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        );

      case 'text':
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;
