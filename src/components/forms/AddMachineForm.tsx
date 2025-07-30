import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMachineStore } from '../../store/useMachineStore';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

const schema = z.object({
  name: z.string().min(1, 'Nome da máquina é obrigatório')
});

type FormData = z.infer<typeof schema>;

const AddMachineForm: React.FC = () => {
  const { addMachine } = useMachineStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      showToast('error', 'Você precisa estar logado para adicionar uma máquina');
      return;
    }
    
    try {
      setLoading(true);
      showToast('info', 'Adicionando máquina...');
      
      await addMachine(data.name, user.id);
      
      showToast('success', 'Máquina adicionada com sucesso!');
      reset();
      navigate('/listar-maquinas');
    } catch (error: any) {
      console.error('Erro ao adicionar máquina:', error);
      showToast('error', `Erro ao adicionar máquina: ${error.message || 'Tente novamente'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Adicionar Nova Máquina</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Máquina
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            placeholder="Digite o nome da máquina"
            className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 
                     placeholder:text-gray-400"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                   transition-colors font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adicionando...
            </span>
          ) : 'Adicionar Máquina'}
        </button>
      </form>
    </div>
  );
};

export default AddMachineForm;