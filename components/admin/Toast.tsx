import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, onClose, duration]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: '✓',
          iconBg: 'bg-green-500',
          text: 'text-green-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: '✕',
          iconBg: 'bg-red-500',
          text: 'text-red-800',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: '⚠',
          iconBg: 'bg-yellow-500',
          text: 'text-yellow-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'ℹ',
          iconBg: 'bg-blue-500',
          text: 'text-blue-800',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div 
      className={`flex items-start gap-3 p-4 rounded-lg border ${styles.bg} shadow-lg animate-slide-in`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${styles.iconBg} flex items-center justify-center text-white text-sm font-bold`} aria-hidden="true">
        {styles.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${styles.text}`}>
          {toast.title}
        </p>
        {toast.message && (
          <p className={`text-sm mt-1 ${styles.text} opacity-90`}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className={`flex-shrink-0 ${styles.text} hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded`}
        aria-label="Close notification"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
