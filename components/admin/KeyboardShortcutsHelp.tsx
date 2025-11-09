import React, { useState, useEffect } from 'react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  { keys: ['Tab'], description: 'Navigate to next element', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Navigate to previous element', category: 'Navigation' },
  { keys: ['Enter'], description: 'Activate button or link', category: 'Navigation' },
  { keys: ['Space'], description: 'Activate button or checkbox', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close modal or dropdown', category: 'Navigation' },
  
  // Tables
  { keys: ['Enter'], description: 'Sort table column', category: 'Tables' },
  { keys: ['Space'], description: 'Sort table column', category: 'Tables' },
  { keys: ['Enter'], description: 'Open row details', category: 'Tables' },
  
  // Dropdowns
  { keys: ['↑'], description: 'Navigate up in dropdown', category: 'Dropdowns' },
  { keys: ['↓'], description: 'Navigate down in dropdown', category: 'Dropdowns' },
  { keys: ['Enter'], description: 'Select dropdown option', category: 'Dropdowns' },
  { keys: ['Escape'], description: 'Close dropdown', category: 'Dropdowns' },
  
  // General
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
];

const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Press ?)"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>
    );
  }

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-2xl font-bold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close keyboard shortcuts"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {categories.map(category => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-700">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-800">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">?</kbd> to toggle this dialog
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
