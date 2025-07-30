import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMachineStore } from '../../store/useMachineStore';

const MachineChart: React.FC = () => {
  const machines = useMachineStore(state => state.machines);

  const data = machines.map(machine => {
    const totalRevenue = machine.revenues.reduce((acc, rev) => acc + rev.amount, 0);
    const totalCosts = machine.costs.reduce((acc, cost) => acc + cost.amount, 0);
    const profit = totalRevenue - totalCosts;

    return {
      name: machine.name,
      receita: totalRevenue,
      custos: totalCosts,
      lucro: profit
    };
  });

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
          <Legend />
          <Line type="monotone" dataKey="receita" stroke="#10B981" name="Receita" />
          <Line type="monotone" dataKey="custos" stroke="#EF4444" name="Custos" />
          <Line type="monotone" dataKey="lucro" stroke="#3B82F6" name="Lucro" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MachineChart;