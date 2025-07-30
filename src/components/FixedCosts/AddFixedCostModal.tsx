import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMachineStore } from '../../store/useMachineStore';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().optional()
});

type FormData = z.infer<typeof schema>;

interface AddFixedCostModalProps {
  machineId: string;
  onClose: () => void;
}

const AddFixedCostModal: React.FC<AddFixedCostModalProps> = ({
  machineId,
  onClose
}) => {
  const { addFixedCost } = useMachineStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addFixedCost(machineId, data);
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar custo fixo:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Adicionar Novo Custo Fixo</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome do Custo
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Ex: Aluguel, Energia, etc"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Valor Mensal
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0,00"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição (opcional)
            </label>
            <textarea
              {...register('description')}
              placeholder="Adicione uma descrição detalhada do custo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFixedCostModal;