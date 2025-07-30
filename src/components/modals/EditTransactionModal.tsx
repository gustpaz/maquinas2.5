import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Transaction } from '../../types/machine';
import { format } from 'date-fns';

const schema = z.object({
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória')
});

type FormData = z.infer<typeof schema>;

interface EditTransactionModalProps {
  transaction: Transaction;
  type: 'cost' | 'revenue';
  onSave: (data: Partial<Transaction>) => void;
  onClose: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  type,
  onSave,
  onClose
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: transaction.amount,
      description: transaction.description,
      date: format(transaction.date, 'yyyy-MM-dd')
    }
  });

  const onSubmit = (data: FormData) => {
    onSave({
      amount: data.amount,
      description: data.description,
      date: new Date(data.date)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Editar {type === 'cost' ? 'Custo' : 'Faturamento'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Valor
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <input
              {...register('description')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Data
            </label>
            <input
              {...register('date')}
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;