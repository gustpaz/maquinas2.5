import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { DemoBanner } from './ui/DemoBanner';
import { DemoTutorial } from './ui/DemoTutorial';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState('Gerenciamento');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isDemo = localStorage.getItem('isDemo') === 'true';
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      if (!user && !isDemo) return;

      try {
        // Verificar primeiro se a tabela existe
        const { error: tableCheckError } = await supabase
          .from('company_settings')
          .select('count(*)', { count: 'exact', head: true });
        
        if (tableCheckError) {
          if (tableCheckError.message?.includes('relation "public.company_settings" does not exist')) {
            console.warn('A tabela company_settings não existe ainda. Criando estrutura básica...');
            return; // A tabela não existe, não podemos continuar
          }
          throw tableCheckError;
        }

        // Se a tabela existe, buscar as configurações
        const userId = isDemo ? '00000000-0000-0000-0000-000000000001' : user?.id;
        
        const { data, error } = await supabase
          .from('company_settings')
          .select('company_name, logo_url')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar configurações:', error);
          return;
        }
        
        // Atualizar estado com os dados encontrados ou manter o padrão
        if (data) {
          setCompanyName(data.company_name || 'Gerenciamento');
          setLogoUrl(data.logo_url);
        }
      } catch (error) {
        console.error('Erro ao buscar configurações da empresa:', error);
        showToast('error', 'Não foi possível carregar as configurações da empresa');
      }
    };

    fetchCompanySettings();
  }, [user, lastUpdate, isDemo, showToast]);

  // Função para forçar atualização
  const refreshCompanySettings = () => {
    setLastUpdate(Date.now());
  };

  const handleLogout = async () => {
    await signOut();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isDemo && <DemoBanner />}
      {isDemo && <DemoTutorial />}
      
      {/* Header Móvel */}
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
          )}
          <h1 className="text-xl font-bold">{companyName}</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex h-full">
        {/* Overlay para dispositivos móveis */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar responsiva */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          companyName={companyName}
          logoUrl={logoUrl}
          refreshCompanySettings={refreshCompanySettings}
        />

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6 mt-16 md:mt-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};