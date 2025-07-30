import React, { useState } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#6366F1'];

type Period = 'all' | '1' | '3' | '6' | '12';

const OverallAnalysis: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { machines, getMachinePerformance } = useMachineStore();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => currentYear - i
  );

  const filterDataByPeriod = (data: any[], date: Date) => {
    if (selectedPeriod === 'all') {
      return date.getFullYear() === selectedYear;
    }
    
    const months = parseInt(selectedPeriod);
    const cutoffDate = subMonths(new Date(), months);
    return date >= cutoffDate && date.getFullYear() === selectedYear;
  };

  const getFilteredPerformance = () => {
    return machines.map(machine => {
      const filteredRevenues = machine.revenues.filter(rev => 
        filterDataByPeriod([rev], new Date(rev.date))
      );
      const filteredCosts = machine.costs.filter(cost => 
        filterDataByPeriod([cost], new Date(cost.date))
      );

      const totalRevenue = filteredRevenues.reduce((acc, rev) => acc + rev.amount, 0);
      const variableCosts = filteredCosts.reduce((acc, cost) => acc + cost.amount, 0);
      
      const monthsInPeriod = selectedPeriod === 'all' ? 12 : parseInt(selectedPeriod);
      const fixedCosts = machine.fixedCosts.reduce((acc, cost) => acc + (cost.amount * monthsInPeriod), 0);
      
      const totalCosts = variableCosts + fixedCosts;
      const profit = totalRevenue - totalCosts;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      return {
        id: machine.id,
        name: machine.name,
        totalRevenue,
        variableCosts,
        fixedCosts,
        totalCosts,
        profit,
        profitMargin,
        status: machine.status
      };
    }).sort((a, b) => b.profit - a.profit);
  };

  const performance = getFilteredPerformance();

  const pieData = performance
    .filter(machine => machine.profit > 0)
    .map(machine => ({
      name: machine.name,
      value: machine.profit
    }));

  const totalRevenue = performance.reduce((acc, machine) => acc + machine.totalRevenue, 0);
  const totalVariableCosts = performance.reduce((acc, machine) => acc + machine.variableCosts, 0);
  const totalFixedCosts = performance.reduce((acc, machine) => acc + machine.fixedCosts, 0);
  const totalCosts = totalVariableCosts + totalFixedCosts;
  const totalProfit = totalRevenue - totalCosts;
  const overallProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Seletor de Período em Destaque */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4">
          <Calendar className="text-blue-600" size={24} />
          <div className="flex-1">
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o período de análise
            </label>
            <div className="flex space-x-2">
              <select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as Period)}
                className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todo o período</option>
                <option value="1">Último mês</option>
                <option value="3">Últimos 3 meses</option>
                <option value="6">Últimos 6 meses</option>
                <option value="12">Último ano</option>
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Análise Geral</h2>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Receita Total</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">Custos Variáveis</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalVariableCosts)}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800">Custos Fixos</h3>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalFixedCosts)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Lucro Total</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Margem de Lucro</h3>
            <p className="text-2xl font-bold text-purple-600">{overallProfitMargin.toFixed(2)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Desempenho Geral */}
          <div className="h-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Desempenho por Máquina</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Máquina: ${label}`}
                />
                <Legend />
                <Bar dataKey="totalRevenue" name="Receita" fill="#10B981" />
                <Bar dataKey="variableCosts" name="Custos Variáveis" fill="#EF4444" />
                <Bar dataKey="fixedCosts" name="Custos Fixos" fill="#F59E0B" />
                <Bar dataKey="profit" name="Lucro" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição de Lucro */}
          <div className="h-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Distribuição de Lucro</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking de Máquinas */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Ranking de Desempenho</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-gray-600">Posição</th>
                  <th className="pb-3 text-gray-600">Máquina</th>
                  <th className="pb-3 text-gray-600">Receita Total</th>
                  <th className="pb-3 text-gray-600">Custos Variáveis</th>
                  <th className="pb-3 text-gray-600">Custos Fixos</th>
                  <th className="pb-3 text-gray-600">Custos Totais</th>
                  <th className="pb-3 text-gray-600">Lucro</th>
                  <th className="pb-3 text-gray-600">Margem de Lucro</th>
                  <th className="pb-3 text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {performance.map((machine, index) => (
                  <tr key={machine.id}>
                    <td className="py-3">{index + 1}º</td>
                    <td className="py-3">{machine.name}</td>
                    <td className="py-3 text-green-600">{formatCurrency(machine.totalRevenue)}</td>
                    <td className="py-3 text-red-600">{formatCurrency(machine.variableCosts)}</td>
                    <td className="py-3 text-yellow-600">{formatCurrency(machine.fixedCosts)}</td>
                    <td className="py-3 text-red-600">{formatCurrency(machine.totalCosts)}</td>
                    <td className={`py-3 ${machine.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(machine.profit)}
                    </td>
                    <td className={`py-3 ${machine.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {machine.profitMargin.toFixed(2)}%
                    </td>
                    <td className="py-3">
                      <span className={
                        machine.status === 'active' ? 'text-green-600' :
                        machine.status === 'maintenance' ? 'text-yellow-600' :
                        'text-red-600'
                      }>
                        {machine.status === 'active' ? 'Ativa' :
                         machine.status === 'maintenance' ? 'Manutenção' :
                         'Inativa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallAnalysis;