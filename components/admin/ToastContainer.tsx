import React, { useState, useCallback } from 'react';
import Toast, { ToastMessage, ToastType } from './Toast';

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Global toast manager
let addToastGlobal: ((type: ToastType, title: string, message?: string) => void) | null = null;

export const showToast = (type: ToastType, title: string, message?: string) => {
  if (addToastGlobal) {
    addToastGlobal(type, title, message);
  }
};

const ToastContainer: React.FC<ToastContainerProps> = ({ position = 'top-right' }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Set global reference
  React.useEffect(() => {
    addToastGlobal = addToast;
    return () => {
      addToastGlobal = null;
    };
  }, [addToast]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 flex flex-col gap-2 max-w-sm w-full`}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
