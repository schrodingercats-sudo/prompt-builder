import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = React.memo(({
  label,
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize selected option to avoid recalculation
  const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoize select handler
  const handleSelect = useCallback((optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label id={`filter-label-${label.replace(/\s+/g, '-').toLowerCase()}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`filter-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="text-sm text-gray-900">
          {selectedOption?.label || 'Select...'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul 
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-labelledby={`filter-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={value === option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-100 ${
                  value === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-900'
                }`}
                aria-label={option.label}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

FilterDropdown.displayName = 'FilterDropdown';

export default FilterDropdown;
