import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { Plan, Subscription, UserProfile } from '../../types/subscription';

export interface SubscriptionSlice {
  currentPlan: Plan | null;
  subscription: Subscription | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchSubscriptionData: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

export const createSubscriptionSlice: StateCreator<SubscriptionSlice> = (set, get) => ({
  currentPlan: null,
  subscription: null,
  userProfile: null,
  loading: false,
  error: null,

  fetchSubscriptionData: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*, subscriptions(*, plans(*))')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Se for admin, tem acesso a tudo
      if (profile.role === 'admin') {
        set({
          userProfile: profile,
          subscription: null,
          currentPlan: {
            id: 'admin',
            name: 'Admin',
            price: 0,
            features: {
              machines: -1,
              reports: true,
              api_access: true,
              white_label: true
            }
          },
          loading: false
        });
        return;
      }

      // Para usuários normais, usar plano da assinatura
      const subscription = profile.subscriptions?.[0];
      const plan = subscription?.plans;

      set({
        userProfile: profile,
        subscription: subscription || null,
        currentPlan: plan || null,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar dados da assinatura:', error);
      set({ error: 'Falha ao carregar dados da assinatura', loading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      set({ loading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      set({
        userProfile: updatedProfile,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      set({ error: 'Falha ao atualizar perfil', loading: false });
    }
  },

  changePlan: async (planId) => {
    try {
      set({ loading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Aqui você implementaria a lógica de pagamento
      // Por enquanto, apenas atualizamos a assinatura
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          cancel_at_period_end: false
        })
        .select('*, plans(*)')
        .single();

      if (error) throw error;

      set({
        subscription,
        currentPlan: subscription.plans,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao mudar plano:', error);
      set({ error: 'Falha ao mudar plano', loading: false });
    }
  },

  cancelSubscription: async () => {
    try {
      set({ loading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true
        })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      set({
        subscription: null,
        currentPlan: null,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      set({ error: 'Falha ao cancelar assinatura', loading: false });
    }
  }
});