import { Machine } from '../types/machine';

export const calculateTotalsByMonth = (machines: Machine[], month: number) => {
  let costs = 0;
  let revenues = 0;

  machines.forEach(machine => {
    const monthCosts = machine.costs
      .filter(cost => new Date(cost.date).getMonth() === month)
      .reduce((acc, cost) => acc + cost.amount, 0);

    const monthRevenues = machine.revenues
      .filter(revenue => new Date(revenue.date).getMonth() === month)
      .reduce((acc, revenue) => acc + revenue.amount, 0);

    costs += monthCosts;
    revenues += monthRevenues;
  });

  return {
    costs,
    revenues,
    profit: revenues - costs
  };
};

export const calculateMachineProfit = (machine: Machine) => {
  const totalRevenues = machine.revenues.reduce((acc, rev) => acc + rev.amount, 0);
  const totalCosts = machine.costs.reduce((acc, cost) => acc + cost.amount, 0);
  return totalRevenues - totalCosts;
};