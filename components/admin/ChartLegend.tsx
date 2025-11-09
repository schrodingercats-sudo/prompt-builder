import React from 'react';

interface LegendItem {
  label: string;
  color: string;
  value?: string | number;
}

interface ChartLegendProps {
  items: LegendItem[];
  orientation?: 'horizontal' | 'vertical';
}

const ChartLegend: React.FC<ChartLegendProps> = ({ 
  items, 
  orientation = 'horizontal' 
}) => {
  const containerClass = orientation === 'horizontal'
    ? 'flex flex-wrap gap-4 justify-center'
    : 'flex flex-col gap-2';

  return (
    <div className={containerClass}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-700">
            {item.label}
            {item.value !== undefined && (
              <span className="font-medium ml-1">({item.value})</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;
