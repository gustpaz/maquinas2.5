import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plan } from '../../types/subscription';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { EditPlanModal } from './modals/EditPlanModal';
import { formatCurrency } from '../../utils/format';

export const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      showToast('error', 'Erro ao buscar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (data: Omit<Plan, 'id'>) => {
    try {
      const { error } = await supabase
        .from('plans')
        .insert([data]);

      if (error) throw error;

      showToast('success', 'Plano criado com sucesso');
      fetchPlans();
    } catch (error) {
      showToast('error', 'Erro ao criar plano');
    }
  };

  const handleUpdatePlan = async (id: string, data: Partial<Plan>) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Plano atualizado com sucesso');
      fetchPlans();
      setEditingPlan(null);
    } catch (error) {
      showToast('error', 'Erro ao atualizar plano');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Plano excluído com sucesso');
      fetchPlans();
    } catch (error) {
      showToast('error', 'Erro ao excluir plano');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciar Planos</h2>
        <button
          onClick={() => setEditingPlan({} as Plan)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Novo Plano</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.id}
            className="bg-white p-6 rounded-lg shadow border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                <p className="text-gray-500">{plan.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <p className="text-2xl font-bold text-gray-900 mb-4">
              {formatCurrency(plan.price)}
              <span className="text-base font-normal text-gray-500">/mês</span>
            </p>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Recursos:</h4>
              <ul className="space-y-1">
                <li className="text-gray-600">
                  • Máquinas: {plan.features.machines === -1 ? 'Ilimitadas' : plan.features.machines}
                </li>
                <li className="text-gray-600">
                  • Relatórios: {plan.features.reports ? 'Sim' : 'Não'}
                </li>
                <li className="text-gray-600">
                  • API: {plan.features.api_access ? 'Sim' : 'Não'}
                </li>
                <li className="text-gray-600">
                  • White Label: {plan.features.white_label ? 'Sim' : 'Não'}
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>

      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onSave={(data) => editingPlan.id ? handleUpdatePlan(editingPlan.id, data) : handleCreatePlan(data)}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
};