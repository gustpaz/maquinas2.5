import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/machine';

export const transactionService = {
  async getTransactions(machineId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('machine_id', machineId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
  },

  async addTransaction(
    machineId: string,
    type: 'cost' | 'revenue',
    transaction: Omit<Transaction, 'id'>
  ) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          machine_id: machineId,
          type,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date.toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, 'id'>>
  ) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};