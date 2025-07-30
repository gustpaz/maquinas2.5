import React from 'react';
import { Users, CreditCard, Settings, DollarSign, BarChart2 } from 'lucide-react';

interface AdminNavProps {
  activeTab: string;
  onTabChange: (tab: 'overview' | 'users' | 'plans' | 'payments' | 'settings') => void;
}

export const AdminNav: React.FC<AdminNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'plans', label: 'Planos', icon: CreditCard },
    { id: 'payments', label: 'Pagamentos', icon: DollarSign },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <nav className="bg-white shadow-sm border border-gray-100 rounded-lg">
      <div className="flex overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-3 text-sm font-medium
                ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }
              `}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};