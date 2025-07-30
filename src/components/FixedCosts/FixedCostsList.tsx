import React, { useState } from 'react';
import { Machine, FixedCost } from '../../types/machine';
import { useMachineStore } from '../../store/useMachineStore';
import { Trash2, Edit, Search } from 'lucide-react';
import EditFixedCostModal from './EditFixedCostModal';
import { formatCurrency } from '../../utils/format';

const FixedCostsList: React.FC = () => {
  const { machines, removeFixedCost } = useMachineStore();
  const [editingCost, setEditingCost] = useState<{
    machineId: string;
    cost: FixedCost;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (machineId: string, costId: string) => {
    if (window.confirm('Tem certeza que deseja remover este custo fixo?')) {
      await removeFixedCost(machineId, costId);
    }
  };

  // Filtrar máquinas e custos baseado na busca
  const filteredMachines = machines.map(machine => ({
    ...machine,
    fixedCosts: machine.fixedCosts.filter(cost =>
      cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(machine => machine.fixedCosts.length > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Custos Fixos Cadastrados</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar custos fixos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {filteredMachines.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum custo fixo encontrado
          </p>
        ) : (
          <div className="space-y-6">
            {filteredMachines.map(machine => (
              <div key={machine.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="font-medium text-lg mb-4">{machine.name}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {machine.fixedCosts.map(cost => (
                    <div
                      key={cost.id}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{cost.name}</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingCost({ machineId: machine.id, cost })}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar custo fixo"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(machine.id, cost.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Remover custo fixo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {cost.description && (
                        <p className="text-sm text-gray-600 mb-2">{cost.description}</p>
                      )}
                      <p className="text-blue-600 font-medium">
                        {formatCurrency(cost.amount)}/mês
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingCost && (
        <EditFixedCostModal
          machineId={editingCost.machineId}
          cost={editingCost.cost}
          onClose={() => setEditingCost(null)}
        />
      )}
    </div>
  );
};

export default FixedCostsList;