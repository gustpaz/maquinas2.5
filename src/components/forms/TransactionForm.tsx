import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMachineStore } from '../../store/useMachineStore';
import { useToast } from '../../contexts/ToastContext';
import { CurrencyInput } from '../ui/CurrencyInput';

const schema = z.object({
  machineId: z.string().min(1, 'Selecione uma máquina'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória')
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  type: 'cost' | 'revenue';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type }) => {
  const { machines, addTransaction } = useMachineStore();
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
      await addTransaction(data.machineId, type, {
        amount: data.amount,
        description: data.description,
        date: new Date(data.date)
      });
      showToast('success', `${type === 'cost' ? 'Custo' : 'Faturamento'} registrado com sucesso!`);
      reset();
    } catch (error) {
      showToast('error', `Erro ao registrar ${type === 'cost' ? 'custo' : 'faturamento'}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Registrar {type === 'cost' ? 'Custo' : 'Faturamento'}
      </h2>

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

        <CurrencyInput
          label="Valor"
          value={amount}
          onChange={(value) => setValue('amount', value)}
          error={errors.amount?.message}
          placeholder="0,00"
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <input
            {...register('description')}
            type="text"
            placeholder="Digite a descrição"
            className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 
                     placeholder:text-gray-400"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Data
          </label>
          <input
            {...register('date')}
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                   transition-colors font-medium"
        >
          Registrar {type === 'cost' ? 'Custo' : 'Faturamento'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;