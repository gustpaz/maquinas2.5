import React from 'react';
import { formatCurrency } from '../utils/format';

interface StatCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  isPercent?: boolean;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  isCurrency = false,
  isPercent = false,
  icon, 
  color 
}) => {
  const colorClasses = {
    green: 'bg-green-100',
    red: 'bg-red-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100'
  };

  const formatValue = () => {
    if (isCurrency) return formatCurrency(value);
    if (isPercent) return `${value.toFixed(2)}%`;
    return value.toString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{formatValue()}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};