import { Machine } from '../../types/machine';
import { calculateTotalRevenue } from './revenue';
import { calculateTotalCosts } from './costs';

export const calculateProfit = (machine: Machine) => {
  const totalRevenue = calculateTotalRevenue(machine);
  const totalCosts = calculateTotalCosts(machine);
  return totalRevenue - totalCosts;
};

export const calculateProfitMargin = (machine: Machine) => {
  const totalRevenue = calculateTotalRevenue(machine);
  const profit = calculateProfit(machine);
  return totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
};