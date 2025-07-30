import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types/subscription';
import { useToast } from '../../contexts/ToastContext';
import { Search, Edit, Key, Shield, UserPlus } from 'lucide-react';
import { EditUserModal } from './modals/EditUserModal';
import { ResetPasswordModal } from './modals/ResetPasswordModal';
import CreateUserModal from './modals/CreateUserModal';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Buscar perfis de usuário
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar assinaturas separadamente
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select(`
          id, 
          status, 
          current_period_end, 
          user_id,
          plans (
            name, 
            price
          )
        `);

      if (subscriptionsError) throw subscriptionsError;

      // Combinar os dados
      const usersWithSubscriptions = profiles?.map(profile => {
        // Encontrar as assinaturas do usuário
        const userSubs = subscriptions?.filter(
          sub => sub.user_id === profile.user_id
        ) || [];

        return {
          ...profile,
          subscriptions: userSubs
        };
      });

      setUsers(usersWithSubscriptions || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      showToast('error', 'Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: Partial<UserProfile>) => {
    try {
      // Atualizar perfil do usuário
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      // Se houver alteração de plano, atualizar ou criar assinatura
      if (data.planId) {
        const { data: user } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('id', userId)
          .single();

        if (!user) throw new Error('Usuário não encontrado');

        // Verificar se já existe uma assinatura
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.user_id)
          .single();

        if (existingSubscription) {
          // Atualizar assinatura existente
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .update({
              plan_id: data.planId,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancel_at_period_end: false
            })
            .eq('id', existingSubscription.id);

          if (subscriptionError) throw subscriptionError;
        } else {
          // Criar nova assinatura
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.user_id,
              plan_id: data.planId,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancel_at_period_end: false
            });

          if (subscriptionError) throw subscriptionError;
        }
      }

      showToast('success', 'Usuário atualizado com sucesso');
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showToast('error', 'Erro ao atualizar usuário');
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (error) throw error;

      showToast('success', 'Senha redefinida com sucesso');
      setResetPasswordUser(null);
    } catch (error) {
      showToast('error', 'Erro ao redefinir senha');
    }
  };

  const filteredUsers = users.filter(user =>
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Gerenciar Usuários</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={20} />
            <span>Novo Usuário</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-3 text-gray-600">Empresa</th>
              <th className="pb-3 text-gray-600">Email</th>
              <th className="pb-3 text-gray-600">Plano</th>
              <th className="pb-3 text-gray-600">Status</th>
              <th className="pb-3 text-gray-600">Tipo</th>
              <th className="pb-3 text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="py-3">{user.company_name}</td>
                <td className="py-3">{user.email}</td>
                <td className="py-3">
                  {user.subscriptions?.[0]?.plans?.name || 'Free'}
                </td>
                <td className="py-3">
                  <span className={`
                    px-2 py-1 rounded-full text-sm
                    ${user.subscriptions?.[0]?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {user.subscriptions?.[0]?.status || 'Sem assinatura'}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`
                    px-2 py-1 rounded-full text-sm
                    ${user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar usuário"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => setResetPasswordUser(user)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Redefinir senha"
                    >
                      <Key size={20} />
                    </button>
                    <button
                      onClick={() => handleUpdateUser(user.id, {
                        role: user.role === 'admin' ? 'user' : 'admin'
                      })}
                      className="text-purple-600 hover:text-purple-800"
                      title="Alterar permissões"
                    >
                      <Shield size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={(data) => handleUpdateUser(editingUser.id, data)}
          onClose={() => setEditingUser(null)}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onSave={(password) => handleResetPassword(resetPasswordUser.user_id, password)}
          onClose={() => setResetPasswordUser(null)}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
};