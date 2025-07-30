import { Machine } from '../../types/machine';
import { calculateTotalRevenue } from './revenue';
import { calculateTotalCosts } from './costs';
import { calculateProfit, calculateProfitMargin } from './profit';

export const calculateMachinePerformance = (machines: Machine[]) => {
  return machines.map(machine => {
    const totalRevenue = calculateTotalRevenue(machine);
    const totalCosts = calculateTotalCosts(machine);
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Calcular custos fixos mensais
    const monthlyFixedCosts = machine.fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);

    return {
      id: machine.id,
      name: machine.name,
      totalRevenue,
      totalCosts,
      monthlyFixedCosts,
      profit,
      profitMargin,
      status: machine.status
    };
  }).sort((a, b) => b.profit - a.profit);
};