import React, { useState } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import TransactionList from './TransactionList';

interface MachineDetailsProps {
  machineId: string;
}

const MachineDetails: React.FC<MachineDetailsProps> = ({ machineId }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const { getTransactionsByMonth, removeTransaction, updateTransaction } = useMachineStore();
  const { costs, revenues } = getTransactionsByMonth(machineId, selectedMonth);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2024, i).toLocaleString('pt-BR', { month: 'long' })
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Detalhes das Transações</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {months.map(month => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-800">Receitas</h3>
          </div>
          <TransactionList
            transactions={revenues}
            type="revenue"
            onRemove={(id) => removeTransaction(machineId, 'revenue', id)}
            onEdit={(id, data) => updateTransaction(machineId, 'revenue', id, data)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-800">Custos</h3>
          </div>
          <TransactionList
            transactions={costs}
            type="cost"
            onRemove={(id) => removeTransaction(machineId, 'cost', id)}
            onEdit={(id, data) => updateTransaction(machineId, 'cost', id, data)}
          />
        </div>
      </div>
    </div>
  );
};

export default MachineDetails;