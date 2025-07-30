import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Machine } from '../../types/machine';
import { PDFReport } from '../reports/PDFReport';
import { calculateTotalsByMonth } from '../../utils/calculations/totals';
import { formatCurrency } from '../../utils/format';

interface AdvancedDashboardProps {
  machines: Machine[];
}

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ machines }) => {
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedMonth] = useState(new Date().getMonth());

  // Dados dos últimos 12 meses
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (selectedMonth - i + 12) % 12;
    const { revenues, costs, profit } = calculateTotalsByMonth(machines, monthIndex);
    return {
      month: format(new Date(selectedYear, monthIndex), 'MMM', { locale: ptBR }),
      receita: revenues,
      custos: costs,
      lucro: profit
    };
  }).reverse();

  // Calcular tendências
  const calculateTrend = (data: number[]) => {
    const n = data.length;
    if (n < 2) return 0;
    const xMean = (n - 1) / 2;
    const yMean = data.reduce((a, b) => a + b, 0) / n;
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (data[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    return numerator / denominator;
  };

  const revenueTrend = calculateTrend(monthlyData.map(d => d.receita));
  const profitTrend = calculateTrend(monthlyData.map(d => d.lucro));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Avançado</h2>
        <PDFReport
          machines={machines}
          month={selectedMonth}
          year={selectedYear}
        />
      </div>

      {/* Indicadores de Tendência */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-medium mb-2">Tendência de Receita</h3>
          <p className={`text-xl sm:text-2xl font-bold ${revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueTrend > 0 ? '↗' : '↘'} {Math.abs(revenueTrend).toFixed(2)}%
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-medium mb-2">Tendência de Lucro</h3>
          <p className={`text-xl sm:text-2xl font-bold ${profitTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitTrend > 0 ? '↗' : '↘'} {Math.abs(profitTrend).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Gráficos Responsivos */}
      <div className="space-y-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-medium mb-4">Evolução Financeira</h3>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={80}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  name="Receita"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="custos"
                  name="Custos"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-medium mb-4">Evolução do Lucro</h3>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={80}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  name="Lucro"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};