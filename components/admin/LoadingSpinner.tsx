import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'purple' | 'blue' | 'gray';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'purple',
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    purple: 'border-purple-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
      {!text && <span className="sr-only">Loading...</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Loading">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
