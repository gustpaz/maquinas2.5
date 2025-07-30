import { StateCreator } from 'zustand';
import { Machine, Transaction } from '../../types/machine';
import { transactionService } from '../../services/supabase/transactions';

export interface TransactionSlice {
  addTransaction: (
    machineId: string,
    type: 'cost' | 'revenue',
    transaction: Omit<Transaction, 'id'>
  ) => Promise<void>;
  updateTransaction: (
    machineId: string,
    type: 'cost' | 'revenue',
    transactionId: string,
    data: Partial<Omit<Transaction, 'id'>>
  ) => Promise<void>;
  removeTransaction: (
    machineId: string,
    type: 'cost' | 'revenue',
    transactionId: string
  ) => Promise<void>;
}

export const createTransactionSlice: StateCreator<TransactionSlice> = (set) => ({
  addTransaction: async (machineId, type, transaction) => {
    try {
      set({ loading: true, error: null });
      const newTransaction = await transactionService.addTransaction(machineId, type, transaction);
      set(state => ({
        machines: state.machines.map(m => {
          if (m.id === machineId) {
            return {
              ...m,
              [type === 'cost' ? 'costs' : 'revenues']: [...m[type === 'cost' ? 'costs' : 'revenues'], newTransaction]
            };
          }
          return m;
        }),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Erro ao adicionar transação', loading: false });
    }
  },

  updateTransaction: async (machineId, type, transactionId, data) => {
    try {
      set({ loading: true, error: null });
      const updatedTransaction = await transactionService.updateTransaction(transactionId, data);
      set(state => ({
        machines: state.machines.map(m => {
          if (m.id === machineId) {
            const transactions = type === 'cost' ? m.costs : m.revenues;
            const updatedTransactions = transactions.map(t =>
              t.id === transactionId ? updatedTransaction : t
            );
            return {
              ...m,
              [type === 'cost' ? 'costs' : 'revenues']: updatedTransactions
            };
          }
          return m;
        }),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Erro ao atualizar transação', loading: false });
    }
  },

  removeTransaction: async (machineId, type, transactionId) => {
    try {
      set({ loading: true, error: null });
      await transactionService.deleteTransaction(transactionId);
      set(state => ({
        machines: state.machines.map(m => {
          if (m.id === machineId) {
            return {
              ...m,
              [type === 'cost' ? 'costs' : 'revenues']: m[type === 'cost' ? 'costs' : 'revenues'].filter(t => t.id !== transactionId)
            };
          }
          return m;
        }),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Erro ao remover transação', loading: false });
    }
  }
});