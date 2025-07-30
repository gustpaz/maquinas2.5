import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  PlusCircle,
  Key,
  Shield,
  CreditCard,
  List,
  MinusCircle,
  PlusSquare,
  BarChart2,
  DollarSign,
  LogOut,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Receipt,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  logoUrl?: string | null;
  refreshCompanySettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  companyName, 
  logoUrl,
  refreshCompanySettings 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isFixedCostsOpen, setIsFixedCostsOpen] = useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const isDemo = localStorage.getItem('isDemo') === 'true';

  useEffect(() => {
    // Verificar se o usuário é admin
    const checkAdminRole = async () => {
      if (isDemo) {
        // Usuário demo nunca é admin
        setIsAdmin(false);
        return;
      }
      
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Erro ao verificar perfil de admin:', error);
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Erro ao verificar perfil:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminRole();
  }, [user, isDemo]);
  
  const menuItems = [
    { icon: <Home size={20} />, text: 'Início', path: '/dashboard' },
    { icon: <PlusCircle size={20} />, text: 'Adicionar Máquina', path: '/adicionar-maquina' },
    { icon: <List size={20} />, text: 'Listar Máquinas', path: '/listar-maquinas' },
    { icon: <BarChart2 size={20} />, text: 'Análise', path: '/analise' },
    { icon: <CreditCard size={20} />, text: 'Planos', path: '/planos' },
    { icon: <Key size={20} />, text: 'API', path: '/api' },
    { 
      icon: <Shield size={20} />, 
      text: 'Admin', 
      path: '/admin',
      adminOnly: true
    }
  ];

  const fixedCostsSubMenu = [
    { icon: <Plus size={20} />, text: 'Cadastrar Custos', path: '/custos-fixos' },
    { icon: <FileText size={20} />, text: 'Custos Cadastrados', path: '/custos-fixos-lista' }
  ];

  const transactionsSubMenu = [
    { icon: <MinusCircle size={20} />, text: 'Registrar Custo', path: '/registrar-custo' },
    { icon: <PlusSquare size={20} />, text: 'Registrar Faturamento', path: '/registrar-faturamento' },
    { icon: <List size={20} />, text: 'Gerenciar Transações', path: '/transacoes' }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isFixedCostsActive = location.pathname.includes('/custos-fixos');
  const isTransactionsActive = location.pathname.includes('/registrar-') || location.pathname.includes('/transacoes');
  
  // Filtrar itens do menu com base no papel do usuário
  const filteredMenuItems = menuItems.filter(item => {
    // Se o item requer admin e o usuário não é admin, não mostrar
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <aside 
      className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-screen
      `}
    >
      <div className="p-4 border-b flex items-center gap-3">
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-8 w-auto object-contain"
          />
        )}
        <h2 className="text-xl font-bold text-blue-600 truncate">{companyName}</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                onClick={() => onClose()}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-lg
                  transition-colors
                  ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
              >
                {item.icon}
                <span>{item.text}</span>
              </Link>
            </li>
          ))}

          {/* Menu Transações com Submenu */}
          <li>
            <button
              onClick={() => setIsTransactionsOpen(!isTransactionsOpen)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg
                transition-colors
                ${isTransactionsActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Receipt size={20} />
                <span>Transações</span>
              </div>
              {isTransactionsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Submenu de Transações */}
            <div className={`mt-2 ml-4 space-y-2 ${isTransactionsOpen ? 'block' : 'hidden'}`}>
              {transactionsSubMenu.map((subItem, index) => (
                <Link
                  key={index}
                  to={subItem.path}
                  onClick={() => onClose()}
                  className={`
                    w-full flex items-center space-x-3 p-3 rounded-lg
                    transition-colors text-sm
                    ${location.pathname === subItem.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                >
                  {subItem.icon}
                  <span>{subItem.text}</span>
                </Link>
              ))}
            </div>
          </li>

          {/* Menu Custos Fixos com Submenu */}
          <li>
            <button
              onClick={() => setIsFixedCostsOpen(!isFixedCostsOpen)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg
                transition-colors
                ${isFixedCostsActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <DollarSign size={20} />
                <span>Custos Fixos</span>
              </div>
              {isFixedCostsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Submenu de Custos Fixos */}
            <div className={`mt-2 ml-4 space-y-2 ${isFixedCostsOpen ? 'block' : 'hidden'}`}>
              {fixedCostsSubMenu.map((subItem, index) => (
                <Link
                  key={index}
                  to={subItem.path}
                  onClick={() => onClose()}
                  className={`
                    w-full flex items-center space-x-3 p-3 rounded-lg
                    transition-colors text-sm
                    ${location.pathname === subItem.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                >
                  {subItem.icon}
                  <span>{subItem.text}</span>
                </Link>
              ))}
            </div>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Link
          to="/configuracoes"
          onClick={() => onClose()}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mb-2"
        >
          <Settings size={20} />
          <span>Configurações</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};