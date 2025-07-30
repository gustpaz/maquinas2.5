import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { Brush, Upload, Lock } from 'lucide-react';
import { useMachineStore } from '../../store/useMachineStore';
import { useAuth } from '../../contexts/AuthContext';

const schema = z.object({
  primaryColor: z.string().min(1, 'Cor primária é obrigatória'),
  secondaryColor: z.string().min(1, 'Cor secundária é obrigatória'),
  customCss: z.string().optional(),
  customJs: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const WhiteLabelSettings: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { currentPlan } = useMachineStore();
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [hasWhiteLabelAccess, setHasWhiteLabelAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Se não encontrar perfil, criar um novo
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              role: 'user'
            })
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            return;
          }

          setIsAdmin(newProfile.role === 'admin');
        } else {
          console.error('Erro ao buscar perfil:', error);
        }
      } else {
        setIsAdmin(profile.role === 'admin');
      }
    };

    checkAdminStatus();
  }, [user]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      customCss: '',
      customJs: ''
    }
  });

  // Observar mudanças nas cores
  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');

  useEffect(() => {
    if (currentPlan) {
      // Admin tem acesso a tudo, outros usuários dependem do plano
      setHasWhiteLabelAccess(isAdmin || currentPlan.features.white_label || false);
    }
  }, [currentPlan, isAdmin]);

  // Aplicar cores em tempo real
  useEffect(() => {
    if (hasWhiteLabelAccess) {
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    }
  }, [primaryColor, secondaryColor, hasWhiteLabelAccess]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('white_label_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setValue('primaryColor', data.primary_color);
        setValue('secondaryColor', data.secondary_color);
        setValue('customCss', data.custom_css || '');
        setValue('customJs', data.custom_js || '');
        setLogoUrl(data.logo_url);
        setFaviconUrl(data.favicon_url);

        // Aplicar configurações
        if (hasWhiteLabelAccess) {
          document.documentElement.style.setProperty('--primary-color', data.primary_color);
          document.documentElement.style.setProperty('--secondary-color', data.secondary_color);
          if (data.custom_css) {
            const styleElement = document.createElement('style');
            styleElement.textContent = data.custom_css;
            document.head.appendChild(styleElement);
          }
          if (data.custom_js) {
            const scriptElement = document.createElement('script');
            scriptElement.textContent = data.custom_js;
            document.body.appendChild(scriptElement);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showToast('error', 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, [setValue, hasWhiteLabelAccess, showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleLogoUpload = async (file: File) => {
    try {
      if (!file) return;

      // Validar tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'A imagem deve ter no máximo 2MB');
        return;
      }

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        showToast('error', 'Formato não suportado. Use PNG, JPG ou GIF');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-logo.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('white-label')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('white-label')
        .getPublicUrl(fileName);

      // Atualizar URL no banco
      const { error: updateError } = await supabase
        .from('white_label_settings')
        .upsert({
          user_id: user.id,
          logo_url: publicUrl
        });

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      showToast('success', 'Logo atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
      showToast('error', 'Erro ao atualizar logo');
    }
  };

  const handleFaviconUpload = async (file: File) => {
    try {
      if (!file) return;

      // Validar tamanho (1MB)
      if (file.size > 1024 * 1024) {
        showToast('error', 'O favicon deve ter no máximo 1MB');
        return;
      }

      // Validar tipo
      if (!['image/x-icon', 'image/png'].includes(file.type)) {
        showToast('error', 'Formato não suportado. Use ICO ou PNG');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-favicon.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('white-label')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('white-label')
        .getPublicUrl(fileName);

      // Atualizar URL no banco
      const { error: updateError } = await supabase
        .from('white_label_settings')
        .upsert({
          user_id: user.id,
          favicon_url: publicUrl
        });

      if (updateError) throw updateError;

      setFaviconUrl(publicUrl);
      showToast('success', 'Favicon atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar favicon:', error);
      showToast('error', 'Erro ao atualizar favicon');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('white_label_settings')
        .upsert({
          user_id: user.id,
          primary_color: data.primaryColor,
          secondary_color: data.secondaryColor,
          custom_css: data.customCss,
          custom_js: data.customJs
        });

      if (error) throw error;

      showToast('success', 'Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showToast('error', 'Erro ao salvar configurações');
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        {!hasWhiteLabelAccess && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Lock className="text-yellow-600" size={20} />
              <p className="text-yellow-800">
                {isAdmin 
                  ? 'Você precisa ter um plano ativo para usar o White Label.'
                  : 'O White Label está disponível apenas em planos que incluem este recurso.'}
                <a href="/planos" className="text-blue-600 hover:text-blue-800 ml-1">
                  Fazer upgrade
                </a>
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-6">
          <Brush className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">White Label</h2>
            <p className="text-sm text-gray-500">
              Personalize completamente a interface para sua marca
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset disabled={!hasWhiteLabelAccess} className={!hasWhiteLabelAccess ? 'opacity-50' : ''}>
            {/* Upload de Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Personalizada
              </label>
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-12 w-auto object-contain"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    PNG, JPG ou GIF (max. 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Upload de Favicon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <div className="flex items-center gap-4">
                {faviconUrl && (
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="h-8 w-8 object-contain"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".ico,image/x-icon,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFaviconUpload(file);
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    ICO ou PNG (max. 1MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Cores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cor Primária
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    {...register('primaryColor')}
                    type="color"
                    className="h-8 w-8 rounded-md border border-gray-300"
                  />
                  <input
                    {...register('primaryColor')}
                    type="text"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {errors.primaryColor && (
                  <p className="mt-1 text-sm text-red-600">{errors.primaryColor.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cor Secundária
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    {...register('secondaryColor')}
                    type="color"
                    className="h-8 w-8 rounded-md border border-gray-300"
                  />
                  <input
                    {...register('secondaryColor')}
                    type="text"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {errors.secondaryColor && (
                  <p className="mt-1 text-sm text-red-600">{errors.secondaryColor.message}</p>
                )}
              </div>
            </div>

            {/* CSS Personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CSS Personalizado
              </label>
              <textarea
                {...register('customCss')}
                rows={5}
                placeholder=".my-class { color: #333; }"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* JavaScript Personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                JavaScript Personalizado
              </label>
              <textarea
                {...register('customJs')}
                rows={5}
                placeholder="// Seu código JavaScript aqui"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Salvar Configurações
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default WhiteLabelSettings;