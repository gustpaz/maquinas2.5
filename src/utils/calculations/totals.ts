import { Machine } from '../../types/machine';
import { calculateMonthlyRevenue } from './revenue';
import { calculateMonthlyCosts } from './costs';

export const calculateTotalsByMonth = (machines: Machine[], month: number) => {
  const revenues = machines.reduce((acc, machine) => 
    acc + calculateMonthlyRevenue(machine, month), 0);
  
  const costs = machines.reduce((acc, machine) => 
    acc + calculateMonthlyCosts(machine, month), 0);

  return {
    costs,
    revenues,
    profit: revenues - costs
  };
};

export const calculateAnnualTotals = (machines: Machine[], year: number) => {
  const monthlyTotals = Array.from({ length: 12 }, (_, month) => {
    return calculateTotalsByMonth(machines, month);
  });

  return {
    costs: monthlyTotals.reduce((acc, month) => acc + month.costs, 0),
    revenues: monthlyTotals.reduce((acc, month) => acc + month.revenues, 0),
    profit: monthlyTotals.reduce((acc, month) => acc + month.profit, 0)
  };
};