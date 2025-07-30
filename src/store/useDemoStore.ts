import { create } from 'zustand';
import { Machine } from '../types/machine';

interface DemoStore {
  machines: Machine[];
}

// Dados mockados para demonstração
const mockMachines: Machine[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Máquina A (Lucrativa)',
    status: 'active',
    lastUpdate: new Date(),
    costs: Array.from({ length: 90 }, (_, i) => ({
      id: `cost-${i}`,
      amount: 100 + Math.random() * 200,
      description: 'Custos operacionais',
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    })),
    revenues: Array.from({ length: 90 }, (_, i) => ({
      id: `revenue-${i}`,
      amount: 500 + Math.random() * 1000,
      description: 'Faturamento diário',
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    })),
    fixedCosts: [
      {
        id: 'fc-1',
        name: 'Aluguel',
        amount: 1000,
        description: 'Aluguel mensal do espaço',
        machineId: '11111111-1111-1111-1111-111111111111'
      },
      {
        id: 'fc-2',
        name: 'Manutenção',
        amount: 500,
        description: 'Manutenção preventiva',
        machineId: '11111111-1111-1111-1111-111111111111'
      }
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Máquina B (Prejuízo)',
    status: 'active',
    lastUpdate: new Date(),
    costs: Array.from({ length: 90 }, (_, i) => ({
      id: `cost-${i}`,
      amount: 400 + Math.random() * 500,
      description: 'Custos operacionais',
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    })),
    revenues: Array.from({ length: 90 }, (_, i) => ({
      id: `revenue-${i}`,
      amount: 200 + Math.random() * 300,
      description: 'Faturamento diário',
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    })),
    fixedCosts: [
      {
        id: 'fc-3',
        name: 'Aluguel',
        amount: 1500,
        description: 'Aluguel mensal do espaço',
        machineId: '22222222-2222-2222-2222-222222222222'
      },
      {
        id: 'fc-4',
        name: 'Manutenção',
        amount: 800,
        description: 'Manutenção preventiva',
        machineId: '22222222-2222-2222-2222-222222222222'
      }
    ]
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Máquina C (Manutenção)',
    status: 'maintenance',
    lastUpdate: new Date(),
    costs: Array.from({ length: 30 }, (_, i) => ({
      id: `cost-${i}`,
      amount: 200 + Math.random() * 300,
      description: 'Custos operacionais',
      date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000)
    })),
    revenues: Array.from({ length: 30 }, (_, i) => ({
      id: `revenue-${i}`,
      amount: 300 + Math.random() * 500,
      description: 'Faturamento diário',
      date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000)
    })),
    fixedCosts: [
      {
        id: 'fc-5',
        name: 'Aluguel',
        amount: 1200,
        description: 'Aluguel mensal do espaço',
        machineId: '33333333-3333-3333-3333-333333333333'
      },
      {
        id: 'fc-6',
        name: 'Manutenção',
        amount: 600,
        description: 'Manutenção preventiva',
        machineId: '33333333-3333-3333-3333-333333333333'
      }
    ]
  }
];

export const useDemoStore = create<DemoStore>(() => ({
  machines: mockMachines
}));