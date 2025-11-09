import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  icon,
  title,
  message,
  action
}) => {
  const defaultIcon = (
    <svg 
      className="h-12 w-12 text-gray-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
      />
    </svg>
  );

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6" role="status">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
          {icon || defaultIcon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label={action.label}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
