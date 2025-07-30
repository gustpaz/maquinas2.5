import React from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useNavigate } from 'react-router-dom';
import AddFixedCostForm from './AddFixedCostForm';
import { Button } from '../ui/Button';
import { List } from 'lucide-react';

const FixedCostsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Custos Fixos</h1>
        <Button
          onClick={() => navigate('/custos-fixos-lista')}
          icon={List}
          className="w-full sm:w-auto"
        >
          Ver Custos Cadastrados
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Custo Fixo</h2>
        <AddFixedCostForm />
      </div>
    </div>
  );
};

export default FixedCostsPage;