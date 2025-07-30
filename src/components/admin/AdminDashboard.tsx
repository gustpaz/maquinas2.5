import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types/subscription';
import { formatCurrency } from '../../utils/format';
import { Users, DollarSign, TrendingDown, Activity, CreditCard, Settings, Key } from 'lucide-react';
import { AdminNav } from './AdminNav';
import { AdminUsers } from './AdminUsers';
import { AdminPlans } from './AdminPlans';
import { AdminPayments } from './AdminPayments';
import { AdminSettings } from './AdminSettings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans' | 'payments' | 'settings'>('overview');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    churnRate: 0
  });

  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar métricas
        const { data: users } = await supabase
          .from('user_profiles')
          .select('*');

        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*, plans(*)');

        if (users && subscriptions) {
          const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
          const monthlyRevenue = activeSubscriptions.reduce((acc, sub) => 
            acc + (sub.plans?.price || 0), 0);

          setMetrics({
            totalUsers: users.length,
            activeSubscriptions: activeSubscriptions.length,
            monthlyRevenue,
            churnRate: calculateChurnRate(users.length, activeSubscriptions.length)
          });
        }

        // Buscar usuários recentes
        const { data: recent } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recent) {
          setRecentUsers(recent);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateChurnRate = (totalUsers: number, activeUsers: number) => {
    if (totalUsers === 0) return 0;
    return ((totalUsers - activeUsers) / totalUsers) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
      
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Usuários Totais</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.totalUsers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Assinaturas Ativas</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.activeSubscriptions}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Activity className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Receita Mensal</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(metrics.monthlyRevenue)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Taxa de Churn</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {metrics.churnRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingDown className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Usuários Recentes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 text-gray-600">Empresa</th>
                    <th className="pb-3 text-gray-600">Tipo</th>
                    <th className="pb-3 text-gray-600">Data de Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentUsers.map(user => (
                    <tr key={user.id}>
                      <td className="py-3">{user.company_name}</td>
                      <td className="py-3">
                        <span className={`
                          px-2 py-1 rounded-full text-sm
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'user' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'plans' && <AdminPlans />}
      {activeTab === 'payments' && <AdminPayments />}
      {activeTab === 'settings' && <AdminSettings />}
    </div>
  );
};

export default AdminDashboard;