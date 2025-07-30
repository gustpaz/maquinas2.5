import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserProfile, Plan } from '../../../types/subscription';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../contexts/ToastContext';

const schema = z.object({
  company_name: z.string().min(1, 'Nome da empresa é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'user', 'guest']),
  planId: z.string().min(1, 'Selecione um plano'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional()
  })
});

type FormData = z.infer<typeof schema>;

interface EditUserModalProps {
  user: UserProfile;
  onSave: (data: Partial<UserProfile>) => void;
  onClose: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onSave,
  onClose
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
        showToast('error', 'Erro ao carregar planos');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: user.company_name,
      email: user.email,
      role: user.role,
      planId: user.plan_id || '',
      phone: user.phone,
      address: user.address
    }
  });

  const handleSave = async (data: FormData) => {
    try {
      // Primeiro, buscar o user_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Perfil não encontrado');

      // Atualizar perfil do usuário
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          company_name: data.company_name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          address: data.address
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Verificar se já existe uma assinatura
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', profile.user_id)
        .single();

      if (existingSubscription) {
        // Atualizar assinatura existente
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({
            plan_id: data.planId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false
          })
          .eq('id', existingSubscription.id);

        if (subscriptionError) throw subscriptionError;
      } else {
        // Criar nova assinatura
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: profile.user_id,
            plan_id: data.planId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false
          });

        if (subscriptionError) throw subscriptionError;
      }

      showToast('success', 'Usuário atualizado com sucesso');
      onSave(data);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showToast('error', 'Erro ao atualizar usuário');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Editar Usuário</h2>
        
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome da Empresa
            </label>
            <input
              {...register('company_name')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Usuário
            </label>
            <select
              {...register('role')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
              <option value="guest">Convidado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Plano
            </label>
            <select
              {...register('planId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um plano</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(plan.price)}/mês
                </option>
              ))}
            </select>
            {errors.planId && (
              <p className="mt-1 text-sm text-red-600">{errors.planId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Endereço</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rua
              </label>
              <input
                {...register('address.street')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cidade
                </label>
                <input
                  {...register('address.city')}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <input
                  {...register('address.state')}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  País
                </label>
                <input
                  {...register('address.country')}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CEP
                </label>
                <input
                  {...register('address.zipCode')}
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
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