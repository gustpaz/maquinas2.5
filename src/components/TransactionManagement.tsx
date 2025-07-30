import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMachineStore } from '../store/useMachineStore';
import { Machine, Transaction } from '../types/machine';
import { Edit, Trash2 } from 'lucide-react';
import EditTransactionModal from './modals/EditTransactionModal';
import { formatCurrency } from '../utils/format';

interface TransactionManagementProps {
  machine: Machine;
  onClose: () => void;
}

const TransactionManagement: React.FC<TransactionManagementProps> = ({ machine }) => {
  const { updateTransaction, removeTransaction } = useMachineStore();
  const [editingTransaction, setEditingTransaction] = useState<{
    transaction: Transaction;
    type: 'cost' | 'revenue';
  } | null>(null);

  const handleEdit = (transaction: Transaction, type: 'cost' | 'revenue') => {
    setEditingTransaction({ transaction, type });
  };

  const handleSave = (type: 'cost' | 'revenue', transactionId: string, data: Partial<Transaction>) => {
    updateTransaction(machine.id, type, transactionId, data);
    setEditingTransaction(null);
  };

  const handleRemove = (type: 'cost' | 'revenue', transactionId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta transação?')) {
      removeTransaction(machine.id, type, transactionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Transações - {machine.name}
          </h2>
        </div>

        {/* Custos */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Custos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-gray-600">Data</th>
                  <th className="pb-3 text-gray-600">Descrição</th>
                  <th className="pb-3 text-gray-600">Valor</th>
                  <th className="pb-3 text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {machine.costs.map(cost => (
                  <tr key={cost.id}>
                    <td className="py-3">
                      {format(cost.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </td>
                    <td className="py-3">{cost.description}</td>
                    <td className="py-3 text-red-600">
                      {formatCurrency(cost.amount)}
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(cost, 'cost')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleRemove('cost', cost.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Faturamentos */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Faturamentos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-gray-600">Data</th>
                  <th className="pb-3 text-gray-600">Descrição</th>
                  <th className="pb-3 text-gray-600">Valor</th>
                  <th className="pb-3 text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {machine.revenues.map(revenue => (
                  <tr key={revenue.id}>
                    <td className="py-3">
                      {format(revenue.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </td>
                    <td className="py-3">{revenue.description}</td>
                    <td className="py-3 text-green-600">
                      {formatCurrency(revenue.amount)}
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(revenue, 'revenue')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleRemove('revenue', revenue.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction.transaction}
          type={editingTransaction.type}
          onSave={(data) => handleSave(
            editingTransaction.type,
            editingTransaction.transaction.id,
            data
          )}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionManagement;