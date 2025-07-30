import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Key, Trash2, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ApiKey } from '../../types/api';
import { useToast } from '../../contexts/ToastContext';

const ApiKeyList: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      showToast('error', 'Erro ao buscar chaves');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar esta chave?')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked: true })
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Chave revogada com sucesso');
      fetchKeys();
    } catch (error) {
      showToast('error', 'Erro ao revogar chave');
    }
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      showToast('success', 'Chave copiada para a área de transferência!');
    } catch (error) {
      showToast('error', 'Erro ao copiar chave');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keys.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          Nenhuma chave de API encontrada
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-gray-600">Nome</th>
                <th className="pb-3 text-gray-600">Chave</th>
                <th className="pb-3 text-gray-600">Último Uso</th>
                <th className="pb-3 text-gray-600">Expira em</th>
                <th className="pb-3 text-gray-600">Status</th>
                <th className="pb-3 text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {keys.map(key => (
                <tr key={key.id}>
                  <td className="py-3">{key.name}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded">
                        <Key size={16} className="text-gray-400" />
                        <code className="text-sm">
                          {key.key.slice(0, 8)}...{key.key.slice(-8)}
                        </code>
                        <button
                          onClick={() => handleCopyKey(key.key)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Copiar chave"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    {key.lastUsedAt
                      ? format(new Date(key.lastUsedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : 'Nunca usada'}
                  </td>
                  <td className="py-3">
                    {key.expiresAt
                      ? format(new Date(key.expiresAt), "dd/MM/yyyy", { locale: ptBR })
                      : 'Não expira'}
                  </td>
                  <td className="py-3">
                    <span className={`
                      px-2 py-1 rounded-full text-sm
                      ${key.revoked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                      }
                    `}>
                      {key.revoked ? 'Revogada' : 'Ativa'}
                    </span>
                  </td>
                  <td className="py-3">
                    {!key.revoked && (
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Revogar chave"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApiKeyList;