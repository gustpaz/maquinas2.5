import React, { useState } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Edit, Trash2 } from 'lucide-react';
import EditTransactionModal from '../modals/EditTransactionModal';
import { Transaction } from '../../types/machine';
import { formatCurrency } from '../../utils/format';

const TransactionsPage: React.FC = () => {
  const { machines, removeTransaction, updateTransaction } = useMachineStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'cost' | 'revenue'>('all');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<{
    machineId: string;
    transaction: Transaction;
    type: 'cost' | 'revenue';
  } | null>(null);

  // Obter todas as transações
  const allTransactions = machines.flatMap(machine => [
    ...machine.costs.map(cost => ({
      ...cost,
      machineId: machine.id,
      machineName: machine.name,
      type: 'cost' as const
    })),
    ...machine.revenues.map(revenue => ({
      ...revenue,
      machineId: machine.id,
      machineName: machine.name,
      type: 'revenue' as const
    }))
  ]);

  // Filtrar transações
  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.machineName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesMachine = selectedMachine === 'all' || transaction.machineId === selectedMachine;

    return matchesSearch && matchesType && matchesMachine;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = async (machineId: string, type: 'cost' | 'revenue', transactionId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta transação?')) {
      await removeTransaction(machineId, type, transactionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Gerenciar Transações</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Filtros */}
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="revenue">Faturamentos</option>
                <option value="cost">Custos</option>
              </select>

              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todas as máquinas</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Busca */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-gray-600">Data</th>
                <th className="pb-3 text-gray-600">Máquina</th>
                <th className="pb-3 text-gray-600">Tipo</th>
                <th className="pb-3 text-gray-600">Descrição</th>
                <th className="pb-3 text-gray-600">Valor</th>
                <th className="pb-3 text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="text-gray-800">
                  <td className="py-3">
                    {format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </td>
                  <td className="py-3">{transaction.machineName}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.type === 'revenue' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'revenue' ? 'Faturamento' : 'Custo'}
                    </span>
                  </td>
                  <td className="py-3">{transaction.description}</td>
                  <td className={`py-3 ${
                    transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingTransaction({
                          machineId: transaction.machineId,
                          transaction,
                          type: transaction.type
                        })}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar transação"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(
                          transaction.machineId,
                          transaction.type,
                          transaction.id
                        )}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Remover transação"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Nenhuma transação encontrada
            </p>
          )}
        </div>
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction.transaction}
          type={editingTransaction.type}
          onSave={(data) => {
            updateTransaction(
              editingTransaction.machineId,
              editingTransaction.type,
              editingTransaction.transaction.id,
              data
            );
            setEditingTransaction(null);
          }}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionsPage;