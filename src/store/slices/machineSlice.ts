import { StateCreator } from 'zustand';
import { Machine } from '../../types/machine';
import { supabase } from '../../lib/supabase';

export interface MachineSlice {
  machines: Machine[];
  loading: boolean;
  error: string | null;
  fetchMachines: () => Promise<void>;
  addMachine: (name: string, userId: string) => Promise<void>;
  removeMachine: (id: string) => Promise<void>;
  updateMachine: (id: string, data: Partial<Machine>) => Promise<void>;
}

export const createMachineSlice: StateCreator<MachineSlice> = (set, get) => ({
  machines: [],
  loading: false,
  error: null,

  fetchMachines: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false, error: 'Usuário não autenticado' });
        return;
      }

      // Buscar máquinas com retry
      const fetchWithRetry = async (retries = 3) => {
        try {
          // Verifica primeiro se a tabela existe
          const { error: tableCheckError } = await supabase
            .from('machines')
            .select('count(*)', { count: 'exact', head: true });
          
          if (tableCheckError) {
            if (tableCheckError.message?.includes('relation "public.machines" does not exist')) {
              // A tabela não existe, precisamos tratar este caso
              console.error('Tabela machines não existe. Por favor, execute as migrações de banco de dados.');
              throw new Error('Tabela machines não existe. Contate o administrador do sistema.');
            }
            throw tableCheckError;
          }
          
          const { data: machines, error: machinesError } = await supabase
            .from('machines')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (machinesError) throw machinesError;
          return machines;
        } catch (error) {
          if (retries > 0) {
            console.log(`Tentativa falhou, tentando novamente (${retries} tentativas restantes)...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(retries - 1);
          }
          throw error;
        }
      };

      const machines = await fetchWithRetry();
      if (!machines) {
        set({ loading: false, error: 'Erro ao buscar máquinas' });
        return;
      }

      // Buscar transações
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .in('machine_id', machines.map(m => m.id))
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Buscar custos fixos
      const { data: fixedCosts, error: fixedCostsError } = await supabase
        .from('fixed_costs')
        .select('*')
        .in('machine_id', machines.map(m => m.id));

      if (fixedCostsError) throw fixedCostsError;

      // Processar e combinar os dados
      const processedMachines = machines.map(machine => ({
        ...machine,
        lastUpdate: new Date(machine.last_update),
        costs: transactions
          ?.filter(t => t.machine_id === machine.id && t.type === 'cost')
          .map(t => ({
            id: t.id,
            amount: t.amount,
            description: t.description,
            date: new Date(t.date)
          })) || [],
        revenues: transactions
          ?.filter(t => t.machine_id === machine.id && t.type === 'revenue')
          .map(t => ({
            id: t.id,
            amount: t.amount,
            description: t.description,
            date: new Date(t.date)
          })) || [],
        fixedCosts: fixedCosts
          ?.filter(fc => fc.machine_id === machine.id)
          .map(fc => ({
            id: fc.id,
            name: fc.name,
            amount: fc.amount,
            description: fc.description,
            machineId: fc.machine_id
          })) || []
      }));
      
      set({ machines: processedMachines, loading: false });
    } catch (error) {
      console.error('Erro ao buscar máquinas:', error);
      set({ error: 'Falha ao buscar máquinas', loading: false });
    }
  },

  addMachine: async (name: string, userId: string) => {
    try {
      set({ loading: true, error: null });
      
      // Verificar se a tabela existe antes de tentar inserir
      const { error: tableCheckError } = await supabase
        .from('machines')
        .select('count(*)', { count: 'exact', head: true });
      
      if (tableCheckError) {
        if (tableCheckError.message?.includes('relation "public.machines" does not exist')) {
          throw new Error('Tabela machines não existe. Contate o administrador do sistema.');
        }
        throw tableCheckError;
      }
      
      console.log('Enviando requisição para adicionar máquina:', { name, userId });
      
      const { data: newMachine, error } = await supabase
        .from('machines')
        .insert({
          name,
          user_id: userId,
          status: 'active',
          last_update: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir máquina:', error);
        throw error;
      }

      if (!newMachine) {
        throw new Error('Máquina não foi criada');
      }

      console.log('Máquina criada com sucesso:', newMachine);

      set(state => ({
        machines: [
          {
            ...newMachine,
            lastUpdate: new Date(newMachine.last_update),
            costs: [],
            revenues: [],
            fixedCosts: []
          },
          ...state.machines
        ],
        loading: false
      }));
      
      return;
    } catch (error) {
      console.error('Erro detalhado ao adicionar máquina:', error);
      set({ error: 'Falha ao adicionar máquina', loading: false });
      throw error;
    }
  },

  removeMachine: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        machines: state.machines.filter(m => m.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error removing machine:', error);
      set({ error: 'Failed to remove machine', loading: false });
    }
  },

  updateMachine: async (id: string, data: Partial<Machine>) => {
    try {
      set({ loading: true, error: null });
      
      const { data: updatedMachine, error } = await supabase
        .from('machines')
        .update({
          ...data,
          last_update: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Fetch updated transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('machine_id', id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch updated fixed costs
      const { data: fixedCosts, error: fixedCostsError } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('machine_id', id);

      if (fixedCostsError) throw fixedCostsError;

      set(state => ({
        machines: state.machines.map(m => m.id === id ? {
          ...updatedMachine,
          lastUpdate: new Date(updatedMachine.last_update),
          costs: transactions
            ?.filter(t => t.type === 'cost')
            .map(t => ({
              id: t.id,
              amount: t.amount,
              description: t.description,
              date: new Date(t.date)
            })) || [],
          revenues: transactions
            ?.filter(t => t.type === 'revenue')
            .map(t => ({
              id: t.id,
              amount: t.amount,
              description: t.description,
              date: new Date(t.date)
            })) || [],
          fixedCosts: fixedCosts?.map(fc => ({
            id: fc.id,
            name: fc.name,
            amount: fc.amount,
            description: fc.description,
            machineId: fc.machine_id
          })) || []
        } : m),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating machine:', error);
      set({ error: 'Failed to update machine', loading: false });
    }
  }
});