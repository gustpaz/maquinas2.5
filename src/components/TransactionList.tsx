import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '../types/machine';
import { Trash2, Edit } from 'lucide-react';
import EditTransactionModal from './EditTransactionModal';
import { formatCurrency } from '../utils/format';

interface TransactionListProps {
  transactions: Transaction[];
  type: 'cost' | 'revenue';
  onRemove: (id: string) => void;
  onEdit: (id: string, data: Partial<Transaction>) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  type,
  onRemove,
  onEdit
}) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="p-4 text-gray-600">Data</th>
              <th className="p-4 text-gray-600">Descrição</th>
              <th className="p-4 text-gray-600">Valor</th>
              <th className="p-4 text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map(transaction => (
              <tr key={transaction.id} className="text-gray-800">
                <td className="p-4">
                  {format(transaction.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </td>
                <td className="p-4">{transaction.description}</td>
                <td className={`p-4 ${type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                  {type === 'revenue' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => onRemove(transaction.id)}
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

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          type={type}
          onSave={(data) => onEdit(editingTransaction.id, data)}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  );
};

export default TransactionList;