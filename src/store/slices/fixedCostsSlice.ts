import { StateCreator } from 'zustand';
import { FixedCost } from '../../types/machine';
import { supabase } from '../../lib/supabase';

interface NewFixedCost {
  name: string;
  amount: number;
  description?: string;
}

export interface FixedCostsSlice {
  addFixedCost: (machineId: string, cost: NewFixedCost) => Promise<void>;
  removeFixedCost: (machineId: string, costId: string) => Promise<void>;
  updateFixedCost: (machineId: string, costId: string, updates: Partial<NewFixedCost>) => Promise<void>;
}

export const createFixedCostsSlice: StateCreator<FixedCostsSlice> = (set, get) => ({
  addFixedCost: async (machineId, cost) => {
    try {
      set({ loading: true, error: null });
      
      const { data: newCost, error } = await supabase
        .from('fixed_costs')
        .insert([{
          machine_id: machineId,
          name: cost.name,
          amount: cost.amount,
          description: cost.description
        }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        machines: state.machines.map(machine => {
          if (machine.id === machineId) {
            return {
              ...machine,
              fixedCosts: [...machine.fixedCosts, {
                id: newCost.id,
                name: newCost.name,
                amount: newCost.amount,
                description: newCost.description,
                machineId: newCost.machine_id
              }]
            };
          }
          return machine;
        }),
        loading: false
      }));
    } catch (error) {
      console.error('Erro ao adicionar custo fixo:', error);
      set({ error: 'Falha ao adicionar custo fixo', loading: false });
    }
  },

  removeFixedCost: async (machineId, costId) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('fixed_costs')
        .delete()
        .eq('id', costId);

      if (error) throw error;

      set(state => ({
        machines: state.machines.map(machine => {
          if (machine.id === machineId) {
            return {
              ...machine,
              fixedCosts: machine.fixedCosts.filter(cost => cost.id !== costId)
            };
          }
          return machine;
        }),
        loading: false
      }));
    } catch (error) {
      console.error('Erro ao remover custo fixo:', error);
      set({ error: 'Falha ao remover custo fixo', loading: false });
    }
  },

  updateFixedCost: async (machineId, costId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { data: updatedCost, error } = await supabase
        .from('fixed_costs')
        .update(updates)
        .eq('id', costId)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        machines: state.machines.map(machine => {
          if (machine.id === machineId) {
            return {
              ...machine,
              fixedCosts: machine.fixedCosts.map(cost => 
                cost.id === costId
                  ? {
                      id: updatedCost.id,
                      name: updatedCost.name,
                      amount: updatedCost.amount,
                      description: updatedCost.description,
                      machineId: updatedCost.machine_id
                    }
                  : cost
              )
            };
          }
          return machine;
        }),
        loading: false
      }));
    } catch (error) {
      console.error('Erro ao atualizar custo fixo:', error);
      set({ error: 'Falha ao atualizar custo fixo', loading: false });
    }
  }
});