import React, { useMemo } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = React.memo(({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}) => {
  // Memoize variant styles to avoid recalculation
  const styles = useMemo(() => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          icon: '⚡',
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  }, [variant]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center text-2xl`} aria-hidden="true">
            {styles.icon}
          </div>
          <div className="flex-1">
            <h3 id="dialog-title" className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p id="dialog-description" className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${styles.confirmBtn}`}
            aria-label={confirmLabel}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;
