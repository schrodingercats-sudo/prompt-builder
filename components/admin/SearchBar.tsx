import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from './utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  initialValue = '',
}) => {
  const [value, setValue] = useState(initialValue);

  // Create debounced search function with useMemo to prevent recreation
  const debouncedSearch = useMemo(
    () => debounce(onSearch, debounceMs),
    [onSearch, debounceMs]
  );

  useEffect(() => {
    debouncedSearch(value);
  }, [value, debouncedSearch]);

  // Memoize clear handler to prevent recreation
  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="relative" role="search">
      <label htmlFor="search-input" className="sr-only">
        {placeholder}
      </label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
          aria-label="Clear search"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
