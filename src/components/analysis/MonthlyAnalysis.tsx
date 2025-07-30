import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMachineStore } from '../../store/useMachineStore';
import { formatCurrency } from '../../utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { MonthSelector } from '../ui/MonthSelector';

const MonthlyAnalysis: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { machines, getTotalsByMonth } = useMachineStore();

  // Dados para o gráfico de barras
  const machineData = machines.map(machine => {
    const totalRevenue = machine.revenues
      .filter(rev => {
        const date = new Date(rev.date);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      })
      .reduce((acc, rev) => acc + rev.amount, 0);
    
    const variableCosts = machine.costs
      .filter(cost => {
        const date = new Date(cost.date);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      })
      .reduce((acc, cost) => acc + cost.amount, 0);
    
    const fixedCosts = machine.fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
    const totalCosts = variableCosts + fixedCosts;

    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      name: machine.name,
      receita: totalRevenue,
      custos_variaveis: variableCosts,
      custos_fixos: fixedCosts,
      custos_totais: totalCosts,
      lucro: profit,
      margem: profitMargin
    };
  });

  // Dados para o gráfico de linha
  const monthlyTotals = Array.from({ length: 12 }, (_, index) => {
    const { revenues, costs, fixedCosts, profit } = getTotalsByMonth(index, selectedYear);
    return {
      month: format(new Date(selectedYear, index), 'MMM', { locale: ptBR }),
      receita: revenues,
      custos_variaveis: costs,
      custos_fixos: fixedCosts,
      custos_totais: costs + fixedCosts,
      lucro: profit
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Análise Mensal</h2>
          <MonthSelector
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras */}
          <div className="min-h-[400px] h-[50vh] lg:h-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Desempenho por Máquina</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineData} margin={{ left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={80}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Máquina: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="receita" name="Receita" fill="#10B981" />
                <Bar dataKey="custos_variaveis" name="Custos Variáveis" fill="#EF4444" />
                <Bar dataKey="custos_fixos" name="Custos Fixos" fill="#F59E0B" />
                <Bar dataKey="lucro" name="Lucro" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Linha */}
          <div className="min-h-[400px] h-[50vh] lg:h-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Tendência Mensal</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTotals} margin={{ left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={80}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="receita" name="Receita" stroke="#10B981" />
                <Line type="monotone" dataKey="custos_variaveis" name="Custos Variáveis" stroke="#EF4444" />
                <Line type="monotone" dataKey="custos_fixos" name="Custos Fixos" stroke="#F59E0B" />
                <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Métricas */}
        <div className="mt-6 overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Máquina</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Receita</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Custos Var.</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Custos Fix.</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Custos Tot.</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Lucro</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {machineData.map(machine => (
                    <tr key={machine.name}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{machine.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">{formatCurrency(machine.receita)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">{formatCurrency(machine.custos_variaveis)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-yellow-600">{formatCurrency(machine.custos_fixos)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">{formatCurrency(machine.custos_totais)}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${machine.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(machine.lucro)}
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${machine.margem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {machine.margem.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyAnalysis;