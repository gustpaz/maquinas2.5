import { Machine } from '../../types/machine';

export const calculateTotalCosts = (machine: Machine) => {
  // Soma dos custos variáveis
  const variableCosts = machine.costs.reduce((acc, cost) => acc + cost.amount, 0);
  
  // Soma dos custos fixos (multiplicado pelos meses desde o início do ano)
  const fixedCosts = machine.fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
  
  return variableCosts + fixedCosts;
};

export const calculateMonthlyCosts = (machine: Machine, month: number) => {
  // Custos variáveis do mês
  const variableCosts = machine.costs
    .filter(cost => new Date(cost.date).getMonth() === month)
    .reduce((acc, cost) => acc + cost.amount, 0);
  
  // Custos fixos (valor mensal)
  const fixedCosts = machine.fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
  
  return variableCosts + fixedCosts;
};