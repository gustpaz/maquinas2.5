import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DemoBanner: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleExit = () => {
    signOut();
  };

  return (
    <div className="bg-blue-600 text-white py-2 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="font-medium">Você está no modo demonstração</span>
        <button
          onClick={() => navigate('/planos')}
          className="inline-flex items-center px-3 py-1 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Adquirir Agora
          <ArrowRight size={16} className="ml-1" />
        </button>
      </div>
      <button
        onClick={handleExit}
        className="text-white hover:text-blue-100 transition-colors"
        title="Sair da demonstração"
      >
        <X size={20} />
      </button>
    </div>
  );
};