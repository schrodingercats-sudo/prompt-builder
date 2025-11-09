import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onReset,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  showDetails = true
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="h-8 w-8 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Error Details */}
        {showDetails && error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
