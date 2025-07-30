import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMachineStore } from '../store/useMachineStore';
import { Trash2, Edit, DollarSign, Search } from 'lucide-react';
import EditMachineModal from './modals/EditMachineModal';
import TransactionManagement from './TransactionManagement';
import { Machine } from '../types/machine';

const MachineList: React.FC = () => {
  const { machines, removeMachine, updateMachine } = useMachineStore();
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Lista de Máquinas</h2>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar máquinas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>
        
        {/* Lista para dispositivos móveis */}
        <div className="block md:hidden">
          {filteredMachines.map(machine => (
            <div key={machine.id} className="p-4 border-b last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{machine.name}</h3>
                  <p className={`text-sm ${
                    machine.status === 'active' ? 'text-green-600' :
                    machine.status === 'maintenance' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {machine.status === 'active' ? 'Ativa' :
                     machine.status === 'maintenance' ? 'Manutenção' :
                     'Inativa'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMachine(machine)}
                    className="p-2 text-green-600 hover:text-green-800"
                    title="Ver Transações"
                  >
                    <DollarSign size={20} />
                  </button>
                  <button
                    onClick={() => setEditingMachine(machine)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="Editar Máquina"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => removeMachine(machine.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Remover Máquina"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Última atualização: {format(machine.lastUpdate, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
              </p>
            </div>
          ))}
        </div>

        {/* Tabela para desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-4 text-gray-600">Nome</th>
                <th className="p-4 text-gray-600">Status</th>
                <th className="p-4 text-gray-600">Última Atualização</th>
                <th className="p-4 text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMachines.map(machine => (
                <tr key={machine.id} className="text-gray-800">
                  <td className="p-4">{machine.name}</td>
                  <td className="p-4">
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
                  <td className="p-4">
                    {format(machine.lastUpdate, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedMachine(machine)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Ver Transações"
                      >
                        <DollarSign size={20} />
                      </button>
                      <button
                        onClick={() => setEditingMachine(machine)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar Máquina"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => removeMachine(machine.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Remover Máquina"
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

      {editingMachine && (
        <EditMachineModal
          machine={editingMachine}
          onSave={(data) => {
            updateMachine(editingMachine.id, data);
            setEditingMachine(null);
          }}
          onClose={() => setEditingMachine(null)}
        />
      )}

      {selectedMachine && (
        <TransactionManagement
          onClose={() => setSelectedMachine(null)}
          machine={selectedMachine}
        />
      )}
    </div>
  );
};

export default MachineList;