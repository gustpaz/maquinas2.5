import { supabase } from '../../lib/supabase';
import { Machine, Transaction } from '../../types/machine';

export const machineService = {
  async getMachines() {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Machine[];
  },

  async addMachine(name: string, userId: string) {
    const { data, error } = await supabase
      .from('machines')
      .insert([
        {
          name,
          user_id: userId,
          status: 'active',
          last_update: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Machine;
  },

  async updateMachine(id: string, updates: Partial<Machine>) {
    const { data, error } = await supabase
      .from('machines')
      .update({
        ...updates,
        last_update: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Machine;
  },

  async deleteMachine(id: string) {
    const { error } = await supabase
      .from('machines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};