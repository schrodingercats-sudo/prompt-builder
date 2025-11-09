import React, { useState, useMemo } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string | number;
}

type SortDirection = 'asc' | 'desc' | null;

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Memoize sorted data to avoid unnecessary recalculations
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;
      
      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const getSortIcon = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return null;
    
    if (sortColumn !== columnKey) {
      return <span className="text-gray-400">↕</span>;
    }
    
    return sortDirection === 'asc' ? (
      <span className="text-purple-600">↑</span>
    ) : (
      <span className="text-purple-600">↓</span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center" role="status" aria-live="polite">
          <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" aria-hidden="true"></div>
          <p className="text-gray-500 mt-4">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center" role="status">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Data table">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(String(column.key), column.sortable)}
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(String(column.key), column.sortable);
                    }
                  }}
                  aria-sort={
                    sortColumn === String(column.key)
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  role={column.sortable ? 'button' : undefined}
                  aria-label={column.sortable ? `Sort by ${column.label}` : column.label}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {getSortIcon(String(column.key), column.sortable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row)}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500' : ''
                } ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                onClick={() => onRowClick?.(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((column) => {
                  const value = row[column.key as keyof T];
                  return (
                    <td key={String(column.key)} className="px-6 py-4 text-sm text-gray-900">
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
const MemoizedDataTable = React.memo(DataTable) as typeof DataTable;

export default MemoizedDataTable;
