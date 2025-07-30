import { Machine } from '../types/machine';

export const saveToLocalStorage = (machines: Machine[]) => {
  try {
    localStorage.setItem('machines', JSON.stringify(machines));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

export const loadFromLocalStorage = (): Machine[] => {
  try {
    const data = localStorage.getItem('machines');
    if (data) {
      const machines = JSON.parse(data);
      return machines.map((machine: Machine) => ({
        ...machine,
        lastUpdate: new Date(machine.lastUpdate),
        costs: machine.costs.map(cost => ({ ...cost, date: new Date(cost.date) })),
        revenues: machine.revenues.map(revenue => ({ ...revenue, date: new Date(revenue.date) }))
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
  return [];
};