import React, { useState } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { PlanCard } from './PlanCard';
import { useToast } from '../../contexts/ToastContext';
import { stripe } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

const PlansPage: React.FC = () => {
  const { currentPlan, subscription, changePlan } = useMachineStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Plano gratuito com recursos básicos',
      price: 0,
      stripePriceId: '',
      features: {
        machines: 2,
        reports: true,
        api_access: false,
        white_label: false
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Plano profissional com mais recursos',
      price: 29.90,
      stripePriceId: 'price_pro',
      features: {
        machines: 10,
        reports: true,
        api_access: true,
        white_label: false
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Plano empresarial completo',
      price: 99.90,
      stripePriceId: 'price_enterprise',
      features: {
        machines: -1,
        reports: true,
        api_access: true,
        white_label: true
      }
    }
  ];

  const handlePlanSelect = async (planId: string) => {
    try {
      setLoading(true);
      const selectedPlan = plans.find(p => p.id === planId);
      
      if (!selectedPlan) {
        throw new Error('Plano não encontrado');
      }

      // Se for plano gratuito, apenas atualizar no banco
      if (selectedPlan.price === 0) {
        await changePlan(planId);
        showToast('success', 'Plano atualizado com sucesso!');
        return;
      }

      // Buscar ou criar customer ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('stripeCustomerId')
        .eq('user_id', user.id)
        .single();

      let customerId = profile?.stripeCustomerId;

      if (!customerId) {
        // Criar customer no Stripe via função edge
        const { data: customer } = await supabase.functions.invoke('create-stripe-customer', {
          body: { email: user.email }
        });
        customerId = customer.id;

        // Atualizar perfil com customer ID
        await supabase
          .from('user_profiles')
          .update({ stripeCustomerId: customerId })
          .eq('user_id', user.id);
      }

      // Criar sessão de checkout
      const { data: session } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: selectedPlan.stripePriceId,
          customerId,
          successUrl: `${window.location.origin}/planos?success=true`,
          cancelUrl: `${window.location.origin}/planos?canceled=true`
        }
      });

      // Redirecionar para checkout
      if (session.url) {
        window.location.href = session.url;
      }

      await changePlan(planId);
      showToast('success', 'Plano atualizado com sucesso!');
    } catch (error) {
      showToast('error', 'Erro ao atualizar plano');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Planos e Preços</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentPlan?.id === plan.id}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>

        {subscription && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Sua Assinatura Atual
            </h3>
            <p className="text-gray-600">
              Status: {subscription.status === 'active' ? 'Ativa' : 'Inativa'}
            </p>
            <p className="text-gray-600">
              Próxima cobrança: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansPage;