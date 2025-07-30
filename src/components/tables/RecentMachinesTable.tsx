import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Machine } from '../../types/machine';
import { StatusBadge } from '../ui/StatusBadge';
import { formatCurrency } from '../../utils/format';

interface RecentMachinesTableProps {
  machines: Machine[];
}

export const RecentMachinesTable: React.FC<RecentMachinesTableProps> = ({ machines }) => {
  const calculateMachineProfit = (machine: Machine) => {
    // Soma dos faturamentos
    const totalRevenue = machine.revenues.reduce((acc, rev) => acc + rev.amount, 0);
    
    // Soma dos custos variáveis
    const variableCosts = machine.costs.reduce((acc, cost) => acc + cost.amount, 0);
    
    // Soma dos custos fixos mensais
    const fixedCosts = machine.fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
    
    // Calcula o número de meses desde o início do ano até o mês atual
    const currentMonth = new Date().getMonth();
    const monthsCount = currentMonth + 1;
    
    // Calcula o total de custos fixos para o período
    const totalFixedCosts = fixedCosts * monthsCount;
    
    // Retorna o lucro total (receita - custos totais)
    return totalRevenue - (variableCosts + totalFixedCosts);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Máquinas Recentes</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-3 text-gray-600">Máquina</th>
              <th className="pb-3 text-gray-600">Último Registro</th>
              <th className="pb-3 text-gray-600">Status</th>
              <th className="pb-3 text-gray-600">Lucro/Prejuízo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {machines.map(machine => {
              const profit = calculateMachineProfit(machine);

              return (
                <tr key={machine.id} className="text-gray-800">
                  <td className="py-3">{machine.name}</td>
                  <td className="py-3">
                    {format(machine.lastUpdate, "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={machine.status} />
                  </td>
                  <td className={`py-3 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};