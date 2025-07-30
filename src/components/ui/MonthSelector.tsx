import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange
}) => {
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2024, i), 'MMMM', { locale: ptBR })
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => currentYear - i
  );

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <select
        value={month}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className="w-full sm:w-auto rounded-md border-gray-300 bg-white shadow-sm 
                 focus:border-blue-500 focus:ring-blue-500"
      >
        {months.map(month => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="w-full sm:w-auto rounded-md border-gray-300 bg-white shadow-sm 
                 focus:border-blue-500 focus:ring-blue-500"
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};