import { StateCreator } from 'zustand';
import { Machine, Transaction } from '../../types/machine';
import { calculateTotalsByMonth } from '../../utils/calculations/totals';
import { calculateMachinePerformance } from '../../utils/calculations/performance';

export interface AnalyticsSlice {
  getTransactionsByMonth: (machineId: string, month: number) => {
    costs: Transaction[];
    revenues: Transaction[];
  };
  getTotalsByMonth: (month: number, year: number) => {
    costs: number;
    revenues: number;
    fixedCosts: number;
    profit: number;
  };
  getMachinePerformance: () => Array<{
    id: string;
    name: string;
    totalRevenue: number;
    totalCosts: number;
    fixedCosts: number;
    profit: number;
    profitMargin: number;
    status: Machine['status'];
  }>;
}

export const createAnalyticsSlice: StateCreator<AnalyticsSlice> = (set, get) => ({
  getTransactionsByMonth: (machineId: string, month: number) => {
    const machine = get().machines.find(m => m.id === machineId);
    if (!machine) return { costs: [], revenues: [] };

    const filterByMonth = (transaction: Transaction) =>
      new Date(transaction.date).getMonth() === month;

    return {
      costs: machine.costs.filter(filterByMonth),
      revenues: machine.revenues.filter(filterByMonth)
    };
  },

  getTotalsByMonth: (month: number, year: number) => {
    const machines = get().machines;
    let revenues = 0;
    let costs = 0;
    let fixedCosts = 0;

    machines.forEach(machine => {
      // Receitas do mês
      revenues += machine.revenues
        .filter(rev => {
          const date = new Date(rev.date);
          return date.getMonth() === month && date.getFullYear() === year;
        })
        .reduce((acc, rev) => acc + rev.amount, 0);

      // Custos variáveis do mês
      costs += machine.costs
        .filter(cost => {
          const date = new Date(cost.date);
          return date.getMonth() === month && date.getFullYear() === year;
        })
        .reduce((acc, cost) => acc + cost.amount, 0);

      // Custos fixos mensais
      fixedCosts += machine.fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
    });

    const totalCosts = costs + fixedCosts;
    return {
      costs,
      revenues,
      fixedCosts,
      profit: revenues - totalCosts
    };
  },

  getMachinePerformance: () => {
    return calculateMachinePerformance(get().machines);
  }
});