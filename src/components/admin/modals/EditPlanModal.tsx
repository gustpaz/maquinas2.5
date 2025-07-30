import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plan } from '../../../types/subscription';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  stripePriceId: z.string().optional(),
  features: z.object({
    machines: z.number().min(-1),
    reports: z.boolean(),
    api_access: z.boolean(),
    white_label: z.boolean()
  })
});

type FormData = z.infer<typeof schema>;

interface EditPlanModalProps {
  plan: Partial<Plan>;
  onSave: (data: Omit<Plan, 'id'>) => void;
  onClose: () => void;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  plan,
  onSave,
  onClose
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || 0,
      stripePriceId: plan.stripePriceId,
      features: {
        machines: plan.features?.machines || 1,
        reports: plan.features?.reports || false,
        api_access: plan.features?.api_access || false,
        white_label: plan.features?.white_label || false
      }
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {plan.id ? 'Editar Plano' : 'Novo Plano'}
        </h2>
        
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Plano
            </label>
            <input
              {...register('name')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preço Mensal (R$)
            </label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID do Preço no Stripe
            </label>
            <input
              {...register('stripePriceId')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Recursos</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número de Máquinas (-1 para ilimitado)
              </label>
              <input
                {...register('features.machines', { valueAsNumber: true })}
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  {...register('features.reports')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Relatórios</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('features.api_access')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Acesso à API</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('features.white_label')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">White Label</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
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