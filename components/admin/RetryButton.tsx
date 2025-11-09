import React, { useState } from 'react';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  text?: string;
  loadingText?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  text = 'Retry',
  loadingText = 'Retrying...',
  className = '',
  variant = 'primary'
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';
  
  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  return (
    <button
      onClick={handleRetry}
      disabled={isRetrying}
      className={`${baseClasses} ${variantClasses[variant]} ${className} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
      aria-label={isRetrying ? loadingText : text}
      aria-busy={isRetrying}
    >
      {isRetrying ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        <>
          <svg 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          {text}
        </>
      )}
    </button>
  );
};

export default RetryButton;
