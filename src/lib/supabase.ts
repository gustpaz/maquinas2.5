import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas!');
  throw new Error('Variáveis de ambiente do Supabase não encontradas');
}

console.log('Inicializando cliente Supabase com URL:', supabaseUrl);

// Criação do cliente com configurações para melhor tratamento de erros e reconexão
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js/2.39.7'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Adicionar uma função para lidar com erros de request
  fetch: (url, options = {}) => {
    console.log(`Fazendo requisição para: ${url}`);
    return fetch(url, {
      ...options,
      // Adicionar timeouts mais longos para conexões potencialmente mais lentas
      signal: options.signal || (new AbortController().signal)
    }).then(response => {
      if (!response.ok) {
        console.warn(`Supabase request failed: ${url} (${response.status})`);
      }
      return response;
    }).catch(error => {
      console.error(`Supabase fetch error: ${error.message} for ${url}`);
      throw error;
    });
  }
});

// Teste de conexão inicial para verificar se o Supabase está respondendo
supabase.from('user_profiles').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
    } else {
      console.log('Conexão com Supabase estabelecida com sucesso. Usuários cadastrados:', count);
    }
  })
  .catch(err => {
    console.error('Erro crítico ao conectar com o Supabase:', err.message);
  });

// Função auxiliar para verificar a disponibilidade do serviço
export const checkSupabaseConnection = async () => {
  try {
    // Tentar uma operação simples
    const { data, error } = await supabase.from('user_profiles').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erro ao verificar conexão com Supabase:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Erro ao conectar com Supabase:', err);
    return false;
  }
};