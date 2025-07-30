import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import WhiteLabelSettings from './WhiteLabelSettings';
import { useMachineStore } from '../../store/useMachineStore';
import { supabase } from '../../lib/supabase';
import { Building2, Trash2, KeyRound, AlertTriangle, Upload } from 'lucide-react';

const UserSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const { machines } = useMachineStore();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch initial company settings
  useEffect(() => {
    const fetchCompanySettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('company_name')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data?.company_name) {
          setCompanyName(data.company_name);
        }
      } catch (error) {
        console.error('Erro ao buscar configurações da empresa:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanySettings();
  }, [user]);

  const handleLogoUpload = async (file: File) => {
    try {
      if (!user) return;
      setLogoError('');
      setIsLoading(true);
      
      // Validar tamanho do arquivo (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setLogoError('A imagem deve ter no máximo 2MB');
        setIsLoading(false);
        return;
      }

      // Validar tipo do arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setLogoError('Formato não suportado. Use PNG, JPG ou GIF');
        setIsLoading(false);
        return;
      }

      // Primeiro, buscar as configurações existentes
      const { data: existingSettings } = await supabase
        .from('company_settings')
        .select('company_name')
        .eq('user_id', user?.id)
        .single();

      // Upload logo to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-logo.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Update company settings with logo URL
      let updateError;
      if (existingSettings) {
        // Se já existe um registro, atualiza
        const { error } = await supabase
          .from('company_settings')
          .update({ 
            logo_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);
        updateError = error;
      } else {
        // Se não existe, insere um novo
        const { error } = await supabase
          .from('company_settings')
          .insert({ 
            user_id: user?.id,
            logo_url: publicUrl,
            company_name: companyName || 'Gerenciamento',
            updated_at: new Date().toISOString()
          });
        updateError = error;
      }

      if (updateError) throw updateError;

      showToast('success', 'Logo atualizada com sucesso!');
      // Forçar atualização do layout
      navigate(0);
    } catch (error) {
      showToast('error', 'Erro ao atualizar logo');
      console.error('Error uploading logo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCompanyName = async () => {
    if (!companyName.trim()) {
      showToast('error', 'O nome da empresa é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      
      // Primeiro, verifica se já existe um registro
      const { data: existingSettings } = await supabase
        .from('company_settings')
        .select()
        .eq('user_id', user?.id)
        .single();

      if (existingSettings) {
        // Se existe, atualiza
        const { error } = await supabase
          .from('company_settings')
          .update({ 
            company_name: companyName.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        // Se não existe, insere
        const { error } = await supabase
          .from('company_settings')
          .insert({ 
          user_id: user?.id,
          company_name: companyName.trim(),
          updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      showToast('success', 'Nome da empresa atualizado com sucesso!');
      
      // Forçar navegação para atualizar o layout
      navigate(0);
    } catch (error) {
      showToast('error', 'Erro ao atualizar nome da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('error', 'As senhas não coincidem');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showToast('success', 'Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showToast('error', 'Erro ao atualizar senha');
    }
  };

  const handleDeleteAllData = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      // Deletar todas as máquinas
      const { error: deleteError } = await supabase
        .from('machines')
        .delete()
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      showToast('success', 'Todos os dados foram apagados com sucesso!');
      setIsDeleting(false);
      
      // Fazer logout após deletar os dados
      await signOut();
    } catch (error) {
      showToast('error', 'Erro ao apagar dados');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>

      {/* Nome da Empresa */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold">Identificação da Empresa</h2>
            <p className="text-sm text-gray-500">
              Nome que será exibido no cabeçalho do sistema
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            value={companyName}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 30) { // Limite de 30 caracteres
                setCompanyName(value);
              }
            }}
            onBlur={(e) => setCompanyName(e.target.value.trim())}
            placeholder="Digite o nome da sua empresa"
            required
            minLength={1}
            maxLength={30}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500">
            {companyName.length}/30 caracteres
          </p>
          <button
            onClick={handleUpdateCompanyName}
            disabled={!companyName.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar Nome'}
          </button>
        </div>
      </div>

      {/* Logo da Empresa */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold">Logo de Identificação</h2>
            <p className="text-sm text-gray-500">
              Logo que será exibida no cabeçalho do sistema
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogoFile(file);
                handleLogoUpload(file);
              }
            }}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {logoError && (
            <p className="text-sm text-red-600">{logoError}</p>
          )}
          <p className="text-sm text-gray-500">
            Formatos aceitos: PNG, JPG, GIF (máx. 2MB)
          </p>
        </div>
      </div>

      {/* Alterar Senha */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Alterar Senha</h2>
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Senha atual"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nova senha"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleChangePassword}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Alterar Senha
          </button>
        </div>
      </div>

      {/* White Label */}
      <WhiteLabelSettings />

      {/* Apagar Dados */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="text-red-600" size={24} />
          <h2 className="text-xl font-semibold">Apagar Todos os Dados</h2>
        </div>
        
        <div className="space-y-4">
          {isDeleting ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-600" size={20} />
                <p className="text-red-800 font-medium">Atenção!</p>
              </div>
              <div className="text-red-600 mb-4">
                Esta ação irá apagar permanentemente todos os seus dados, incluindo:
                <ul className="list-disc list-inside mt-2">
                  <li>Todas as {machines.length} máquinas cadastradas</li>
                  <li>Todos os registros de custos e faturamentos</li>
                  <li>Todas as configurações personalizadas</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAllData}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Sim, apagar tudo
                </button>
                <button
                  onClick={() => setIsDeleting(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleDeleteAllData}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Apagar Todos os Dados
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;