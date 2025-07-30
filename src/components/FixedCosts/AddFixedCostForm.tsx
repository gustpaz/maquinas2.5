import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMachineStore } from '../../store/useMachineStore';
import { useToast } from '../../contexts/ToastContext';
import { CurrencyInput } from '../ui/CurrencyInput';

const schema = z.object({
  machineId: z.string().min(1, 'Selecione uma máquina'),
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const AddFixedCostForm: React.FC = () => {
  const { machines, addFixedCost } = useMachineStore();
  const { showToast } = useToast();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0
    }
  });

  const amount = watch('amount');

  const onSubmit = async (data: FormData) => {
    try {
      await addFixedCost(data.machineId, {
        name: data.name,
        amount: data.amount,
        description: data.description
      });
      showToast('success', 'Custo fixo adicionado com sucesso!');
      reset();
    } catch (error) {
      showToast('error', 'Erro ao adicionar custo fixo');
      console.error('Erro ao adicionar custo fixo:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="machineId" className="block text-sm font-medium text-gray-700 mb-1">
          Máquina
        </label>
        <select
          {...register('machineId')}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Selecione uma máquina</option>
          {machines.map(machine => (
            <option key={machine.id} value={machine.id}>
              {machine.name}
            </option>
          ))}
        </select>
        {errors.machineId && (
          <p className="mt-1 text-sm text-red-600">{errors.machineId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Custo
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="Digite o nome do custo fixo"
          className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500 
                   placeholder:text-gray-400"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <CurrencyInput
        label="Valor Mensal"
        value={amount}
        onChange={(value) => setValue('amount', value)}
        error={errors.amount?.message}
        placeholder="0,00"
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição (opcional)
        </label>
        <textarea
          {...register('description')}
          placeholder="Digite uma descrição (opcional)"
          className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500 
                   placeholder:text-gray-400"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                 transition-colors font-medium"
      >
        Adicionar Custo Fixo
      </button>
    </form>
  );
};

export default AddFixedCostForm;