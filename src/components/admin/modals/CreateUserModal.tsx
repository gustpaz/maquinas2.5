import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../../contexts/ToastContext';
import { supabase } from '../../../lib/supabase';
import { Plan } from '../../../types/subscription';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  companyName: z.string().min(1, 'Nome da empresa é obrigatório'),
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

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [settings, setSettings] = React.useState<{ trialEnabled: boolean; trialDays: number }>({
    trialEnabled: false,
    trialDays: 7
  });
  const [loading, setLoading] = React.useState(true);
  const { showToast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'user',
      planId: '',
      address: {}
    }
  });

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Buscar configurações
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('trial_enabled, trial_days')
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .single();

        if (settingsError) throw settingsError;
        if (settingsData) {
          setSettings({
            trialEnabled: settingsData.trial_enabled,
            trialDays: settingsData.trial_days
          });
        }

        // Buscar planos
        const { data, error } = await supabase
          .from('plans')
          .select(`
            id,
            name,
            description,
            price,
            features
          `)
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

  const onSubmit = async (data: FormData) => {
    try {
      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // Calcular data de fim do período de teste
      const trialEnd = settings.trialEnabled
        ? new Date(Date.now() + settings.trialDays * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Status inicial da assinatura
      const initialStatus = settings.trialEnabled ? 'trialing' : 'active';

      // Criar assinatura
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: authData.user.id,
          plan_id: data.planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: trialEnd.toISOString(),
          cancel_at_period_end: false
        });

      if (subscriptionError) throw subscriptionError;

      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          email: data.email,
          company_name: data.companyName,
          role: data.role,
          phone: data.phone,
          address: data.address
        });

      if (profileError) throw profileError;

      showToast('success', 'Usuário criado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      showToast('error', 'Erro ao criar usuário');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Criar Novo Usuário</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              Senha
            </label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome da Empresa
            </label>
            <input
              {...register('companyName')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
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
            {settings.trialEnabled && (
              <p className="text-sm text-gray-500 mb-2">
                O usuário terá {settings.trialDays} dias de teste gratuito
              </p>
            )}
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
              Criar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;