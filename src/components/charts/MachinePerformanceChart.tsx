import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useMachineStore } from '../../store/useMachineStore';

const MachinePerformanceChart: React.FC = () => {
  const machinePerformance = useMachineStore(state => state.getMachinePerformance());

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Desempenho das Máquinas</h2>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-gray-600">Máquina</th>
                <th className="pb-3 text-gray-600">Receita Total</th>
                <th className="pb-3 text-gray-600">Custos Totais</th>
                <th className="pb-3 text-gray-600">Lucro</th>
                <th className="pb-3 text-gray-600">Margem de Lucro</th>
                <th className="pb-3 text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {machinePerformance.map(machine => (
                <tr key={machine.id} className="text-gray-800">
                  <td className="py-3">{machine.name}</td>
                  <td className="py-3 text-green-600">R$ {machine.totalRevenue.toFixed(2)}</td>
                  <td className="py-3 text-red-600">R$ {machine.totalCosts.toFixed(2)}</td>
                  <td className={`py-3 ${machine.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {machine.profit.toFixed(2)}
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

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={machinePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                labelFormatter={(label) => `Máquina: ${label}`}
              />
              <Legend />
              <Bar dataKey="totalRevenue" name="Receita" fill="#10B981" />
              <Bar dataKey="totalCosts" name="Custos" fill="#EF4444" />
              <Bar dataKey="profit" name="Lucro" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MachinePerformanceChart;