import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => [string, string];
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload, 
  label,
  formatter 
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
      {label && (
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const [formattedValue, formattedName] = formatter 
            ? formatter(entry.value, entry.name)
            : [entry.value, entry.name];

          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{formattedName}:</span>
              <span className="text-sm font-medium text-gray-900">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTooltip;
