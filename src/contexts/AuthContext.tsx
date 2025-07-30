import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';

// Definir tipo do contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  trialExpired: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialExpired, setTrialExpired] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Verificar se é usuário demo
  const isDemo = localStorage.getItem('isDemo') === 'true';

  // Verificar status do período de teste
  const checkTrialStatus = async (userId: string) => {
    try {
      // Buscar data de criação do usuário e status da assinatura
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          created_at,
          subscriptions (
            status,
            current_period_end
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // Se não encontrou perfil
      if (!profile) {
        // Criar um perfil para o usuário
        try {
          await supabase
            .from('user_profiles')
            .insert([{ user_id: userId }]);
        } catch (insertError) {
          console.error("Erro ao criar perfil:", insertError);
        }
        
        // Usuário recém criado não expirou
        setTrialExpired(false);
        return;
      }

      const subscription = profile.subscriptions?.[0];
      
      // Se tem assinatura ativa, não está em trial
      if (subscription?.status === 'active') {
        setTrialExpired(false);
        return;
      }

      // Calcular se o período de teste expirou (7 dias)
      const createdAt = new Date(profile.created_at);
      const trialEndDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      const expired = new Date() > trialEndDate;

      setTrialExpired(expired);

      // Se expirou, mostrar mensagem e redirecionar
      if (expired) {
        showToast('error', 'Seu período de teste expirou. Por favor, escolha um plano para continuar.');
        navigate('/planos');
      }
    } catch (error) {
      console.error('Erro ao verificar status do trial:', error);
    }
  };

  useEffect(() => {
    // Check current session
    const initAuth = async () => {
      try {
        // Se for demo, retornar usuário mockado
        if (isDemo) {
          setUser({
            id: '00000000-0000-0000-0000-000000000001',
            email: 'demo@example.com',
            role: 'authenticated'
          } as any);
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
        
        // Verificar trial se houver usuário
        if (session?.user) {
          await checkTrialStatus(session.user.id);
        }

      } catch (error) {
        console.error('Error checking auth session:', error);
        showToast('error', 'Erro ao verificar sessão');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Verificar trial quando usuário fizer login
      if (event === 'SIGNED_IN' && session?.user) {
        await checkTrialStatus(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [showToast, navigate, isDemo]);

  const handleAuthError = (error: AuthError | Error) => {
    console.error('Auth error:', error);
    
    // Erro de rede
    if (error.message === 'Failed to fetch') {
      return new Error('Erro de conexão. Por favor, verifique sua internet e tente novamente.');
    }
    
    // Erros específicos da autenticação
    if (error.message.includes('Email not confirmed')) {
      return new Error('Por favor, confirme seu email antes de fazer login.');
    }
    
    if (error.message.includes('Invalid login credentials')) {
      return new Error('Email ou senha incorretos.');
    }
    
    if (error.message.includes('Password should be at least')) {
      return new Error('A senha deve ter pelo menos 8 caracteres.');
    }
    
    if (error.message.includes('User already registered')) {
      return new Error('Este email já está em uso.');
    }
    
    return new Error('Erro de autenticação. Por favor, tente novamente.');
  };

  const signIn = async (email: string, password: string, retries = 3): Promise<void> => {
    try {
      console.log('Tentando fazer login com:', email);
      
      // Aguardar um tempo antes de tentar novamente
      if (retries < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Validação básica
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        // Se for erro de rede e ainda tiver tentativas, tentar novamente
        if (error.message === 'Failed to fetch' && retries > 0) {
          console.log(`Tentativa ${4 - retries} de login falhou. Tentando novamente...`);
          return signIn(email, password, retries - 1);
        }
        throw error;
      }
      
      console.log('Login bem-sucedido:', data);
      
      // Se o login for bem-sucedido
      if (data?.user) {
        setUser(data.user);
        showToast('success', 'Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        throw new Error('Erro inesperado no login');
      }
    } catch (error) {
      console.error('Erro detalhado no login:', error);
      throw handleAuthError(error as AuthError);
    }
  };

  const signUp = async (email: string, password: string, retries = 3): Promise<void> => {
    try {
      // Aguardar um tempo antes de tentar novamente
      if (retries < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email_confirmed: true
          }
        }
      });
      
      if (error) {
        // Se for erro de rede e ainda tiver tentativas, tentar novamente
        if (error.message === 'Failed to fetch' && retries > 0) {
          console.log(`Tentativa ${4 - retries} de criar usuário falhou. Tentando novamente...`);
          return signUp(email, password, retries - 1);
        }
        throw error;
      }

      // Se chegou aqui, o registro foi bem sucedido
      showToast('success', 'Conta criada com sucesso! Por favor, faça login.');
      navigate('/login');
    } catch (error) {
      throw handleAuthError(error as AuthError);
    }
  };

  const signOut = async () => {
    try {
      // Se for demo, apenas limpar o localStorage
      if (localStorage.getItem('isDemo') === 'true') {
        localStorage.removeItem('isDemo');
        setUser(null);
        navigate('/');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar o estado do usuário
      setUser(null);
      navigate('/');
    } catch (error) {
      throw handleAuthError(error as AuthError);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, trialExpired, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}