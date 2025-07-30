import { Machine } from '../../types/machine';

export const calculateTotalRevenue = (machine: Machine) => {
  return machine.revenues.reduce((acc, rev) => acc + rev.amount, 0);
};

export const calculateMonthlyRevenue = (machine: Machine, month: number) => {
  return machine.revenues
    .filter(revenue => new Date(revenue.date).getMonth() === month)
    .reduce((acc, revenue) => acc + revenue.amount, 0);
};