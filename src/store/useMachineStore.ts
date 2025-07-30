import { create } from 'zustand';
import { MachineSlice, createMachineSlice } from './slices/machineSlice';
import { TransactionSlice, createTransactionSlice } from './slices/transactionSlice';
import { AnalyticsSlice, createAnalyticsSlice } from './slices/analyticsSlice';
import { FixedCostsSlice, createFixedCostsSlice } from './slices/fixedCostsSlice';
import { SubscriptionSlice, createSubscriptionSlice } from './slices/subscriptionSlice';
import { Machine } from '../types/machine';
import { useDemoStore } from './useDemoStore';

type StoreState = MachineSlice & TransactionSlice & AnalyticsSlice & FixedCostsSlice & SubscriptionSlice;

export const useMachineStore = create<StoreState>()((...args) => {
  // Verificar se é usuário demo
  const isDemo = localStorage.getItem('isDemo') === 'true';
  
  // Se for demo, usar dados mockados
  if (isDemo) {
    const demoMachines = useDemoStore.getState().machines;
    
    return {
      // Dados base
      machines: demoMachines,
      currentPlan: null,
      subscription: null,
      userProfile: null,
      loading: false,
      error: null,
      
      // Funções de máquinas (mockadas para demo)
      fetchMachines: async () => {
        console.log('Demo: fetchMachines chamado');
      },
      addMachine: async (name: string) => {
        console.log('Demo: addMachine chamado', name);
        // No modo demo, podemos atualizar o estado local, mas não salvamos no banco
        const newMachine: Machine = {
          id: `demo-${Date.now()}`,
          name,
          status: 'active',
          lastUpdate: new Date(),
          costs: [],
          revenues: [],
          fixedCosts: []
        };
        
        useDemoStore.setState(state => ({
          machines: [newMachine, ...state.machines]
        }));
        
        // Atualizar o estado do useMachineStore com as máquinas atualizadas
        args[0](state => ({
          ...state,
          machines: [newMachine, ...demoMachines]
        }));
      },
      removeMachine: async (id: string) => {
        console.log('Demo: removeMachine chamado', id);
        const updatedMachines = demoMachines.filter(m => m.id !== id);
        useDemoStore.setState({ machines: updatedMachines });
        
        args[0](state => ({
          ...state,
          machines: updatedMachines
        }));
      },
      updateMachine: async (id: string, data: Partial<Machine>) => {
        console.log('Demo: updateMachine chamado', id, data);
        const updatedMachines = demoMachines.map(m => 
          m.id === id ? { ...m, ...data, lastUpdate: new Date() } : m
        );
        useDemoStore.setState({ machines: updatedMachines });
        
        args[0](state => ({
          ...state,
          machines: updatedMachines
        }));
      },
      
      // Funções de transações (mockadas)
      addTransaction: async (machineId: string, type: 'cost' | 'revenue', transaction: any) => {
        console.log('Demo: addTransaction chamado', machineId, type, transaction);
        const updatedMachines = demoMachines.map(m => {
          if (m.id === machineId) {
            const newTransaction = {
              id: `demo-${Date.now()}`,
              ...transaction
            };
            
            if (type === 'cost') {
              return { ...m, costs: [newTransaction, ...m.costs] };
            } else {
              return { ...m, revenues: [newTransaction, ...m.revenues] };
            }
          }
          return m;
        });
        
        useDemoStore.setState({ machines: updatedMachines });
        
        args[0](state => ({
          ...state,
          machines: updatedMachines
        }));
      },
      updateTransaction: async (machineId, type, transactionId, data) => {
        console.log('Demo: updateTransaction chamado');
        const updatedMachines = demoMachines.map(m => {
          if (m.id === machineId) {
            const transactions = type === 'cost' ? m.costs : m.revenues;
            const updatedTransactions = transactions.map(t => 
              t.id === transactionId ? { ...t, ...data } : t
            );
            
            return {
              ...m, 
              ...(type === 'cost' ? { costs: updatedTransactions } : { revenues: updatedTransactions })
            };
          }
          return m;
        });
        
        useDemoStore.setState({ machines: updatedMachines });
        
        args[0](state => ({
          ...state,
          machines: updatedMachines
        }));
      },
      removeTransaction: async (machineId, type, transactionId) => {
        console.log('Demo: removeTransaction chamado');
        const updatedMachines = demoMachines.map(m => {
          if (m.id === machineId) {
            const transactions = type === 'cost' ? m.costs : m.revenues;
            const updatedTransactions = transactions.filter(t => t.id !== transactionId);
            
            return {
              ...m, 
              ...(type === 'cost' ? { costs: updatedTransactions } : { revenues: updatedTransactions })
            };
          }
          return m;
        });
        
        useDemoStore.setState({ machines: updatedMachines });
        
        args[0](state => ({
          ...state,
          machines: updatedMachines
        }));
      },
      
      // Funções de custos fixos (mockadas)
      addFixedCost: async (machineId, cost) => {
        console.log('Demo: addFixedCost chamado');
        const updatedMachines = demoMachines.map(m => {
          if (m.id === machineId) {
            const newCost = {
              id: `demo-${Date.now()}`,
              ...cost,
              machineId
            };
            
            return { ...m, fixedCosts: [...m.fixedCosts, newCost] };
          }
          return m;
        });
        
        useDemoStore.setState({ machines: updatedMachines });
        
        args[0](state => ({
          ...state,
          machines: updatedMachines
        }));
      },
      removeFixedCost: async (machineId, costId) => {
        console.log('Demo: removeFixedCost chamado');
        const updatedMachines = demoMachines.map(m => {
          if (m.id === machineId) {
            return {
              ...m,
              fixedCosts: m.fixedCosts.filter(c => c.id !== costId)
            };
          }
          return m;
        });
        
        useDemoStore.setState({ machines: updatedMachines });
        
        args[0](state => ({
          ...state,
          machines: updatedMachines
        }));
      },
      updateFixedCost: async (machineId, costId, data) => {
        console.log('Demo: updateFixedCost chamado');
        const updatedMachines = demoMachines.map(m => {
          if (m.id === machineId) {
            return {
              ...m,
              fixedCosts: m.fixedCosts.map(c => 
                c.id === costId ? { ...c, ...data } : c
              )
            };
          }
          return m;
        });
        
        useDemoStore.setState({ machines: updatedMachines });
        
        args[0](state => ({
          ...state,
          machines: updatedMachines
        }));
      },
      
      // Funções de análise
      getTransactionsByMonth: (machineId, month) => {
        console.log('Demo: getTransactionsByMonth chamado');
        const machine = demoMachines.find(m => m.id === machineId);
        if (!machine) return { costs: [], revenues: [] };
        
        const filterByMonth = (transaction: any) => 
          new Date(transaction.date).getMonth() === month;
        
        return {
          costs: machine.costs.filter(filterByMonth),
          revenues: machine.revenues.filter(filterByMonth)
        };
      },
      getTotalsByMonth: (month, year) => {
        console.log('Demo: getTotalsByMonth chamado');
        let revenues = 0;
        let costs = 0;
        let fixedCosts = 0;
        
        demoMachines.forEach(m => {
          revenues += m.revenues
            .filter(r => {
              const date = new Date(r.date);
              return date.getMonth() === month && date.getFullYear() === year;
            })
            .reduce((sum, r) => sum + r.amount, 0);
            
          costs += m.costs
            .filter(c => {
              const date = new Date(c.date);
              return date.getMonth() === month && date.getFullYear() === year;
            })
            .reduce((sum, c) => sum + c.amount, 0);
            
          fixedCosts += m.fixedCosts.reduce((sum, fc) => sum + fc.amount, 0);
        });
        
        return {
          costs,
          revenues,
          fixedCosts, 
          profit: revenues - (costs + fixedCosts)
        };
      },
      getMachinePerformance: () => {
        console.log('Demo: getMachinePerformance chamado');
        return demoMachines.map(m => {
          const totalRevenue = m.revenues.reduce((sum, r) => sum + r.amount, 0);
          const variableCosts = m.costs.reduce((sum, c) => sum + c.amount, 0);
          const fixedCosts = m.fixedCosts.reduce((sum, fc) => sum + fc.amount, 0);
          const totalCosts = variableCosts + fixedCosts;
          const profit = totalRevenue - totalCosts;
          const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
          
          return {
            id: m.id,
            name: m.name,
            totalRevenue,
            totalCosts,
            fixedCosts,
            profit,
            profitMargin,
            status: m.status
          };
        });
      },
      
      // Funções de assinatura (mockadas)
      fetchSubscriptionData: async () => {
        console.log('Demo: fetchSubscriptionData chamado');
      },
      updateProfile: async () => {
        console.log('Demo: updateProfile chamado');
      },
      changePlan: async () => {
        console.log('Demo: changePlan chamado');
      },
      cancelSubscription: async () => {
        console.log('Demo: cancelSubscription chamado');
      }
    };
  }

  return {
    ...createMachineSlice(...args),
    ...createTransactionSlice(...args),
    ...createAnalyticsSlice(...args),
    ...createFixedCostsSlice(...args),
    ...createSubscriptionSlice(...args)
  };
});