import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { CreditCard, Mail, Globe } from 'lucide-react';

interface Settings {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  trialEnabled: boolean;
  trialDays: number;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  domain: string;
  apiUrl: string;
}

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    trialEnabled: false,
    trialDays: 7,
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    domain: '',
    apiUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          stripePublishableKey: data.stripe_publishable_key || '',
          stripeSecretKey: data.stripe_secret_key || '',
          stripeWebhookSecret: data.stripe_webhook_secret || '',
          trialEnabled: data.trial_enabled || false,
          trialDays: data.trial_days || 7,
          smtpHost: data.smtp_host || '',
          smtpPort: data.smtp_port || '',
          smtpUser: data.smtp_user || '',
          smtpPass: data.smtp_pass || '',
          smtpFrom: data.smtp_from || '',
          domain: data.domain || '',
          apiUrl: data.api_url || ''
        });
      } else {
        // Se não existir configurações, criar registro padrão
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert([{
            stripe_publishable_key: settings.stripePublishableKey,
            stripe_secret_key: settings.stripeSecretKey,
            stripe_webhook_secret: settings.stripeWebhookSecret,
            smtp_host: settings.smtpHost,
            smtp_port: settings.smtpPort,
            smtp_user: settings.smtpUser,
            smtp_pass: settings.smtpPass,
            smtp_from: settings.smtpFrom,
            domain: settings.domain,
            api_url: settings.apiUrl
          }])
          .select()
          .single();

        if (createError) throw createError;
        if (newSettings) {
          setSettings({
            stripePublishableKey: newSettings.stripe_publishable_key || '',
            stripeSecretKey: newSettings.stripe_secret_key || '',
            stripeWebhookSecret: newSettings.stripe_webhook_secret || '',
            smtpHost: newSettings.smtp_host || '',
            smtpPort: newSettings.smtp_port || '',
            smtpUser: newSettings.smtp_user || '',
            smtpPass: newSettings.smtp_pass || '',
            smtpFrom: newSettings.smtp_from || '',
            domain: newSettings.domain || '',
            apiUrl: newSettings.api_url || ''
          });
        }
      }
    } catch (error) {
      showToast('error', 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: keyof Settings, value: string) => {
    try {
      // Mapear nomes das colunas do banco
      const columnMap: Record<keyof Settings, string> = {
        stripePublishableKey: 'stripe_publishable_key',
        stripeSecretKey: 'stripe_secret_key',
        stripeWebhookSecret: 'stripe_webhook_secret',
        smtpHost: 'smtp_host',
        smtpPort: 'smtp_port',
        smtpUser: 'smtp_user',
        smtpPass: 'smtp_pass',
        smtpFrom: 'smtp_from',
        domain: 'domain',
        apiUrl: 'api_url'
      };
      const { error } = await supabase
        .from('settings')
        .update({ [columnMap[section]]: value })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      showToast('success', 'Configurações salvas com sucesso');
      
      // Atualizar estado local
      setSettings(prev => ({
        ...prev,
        [section]: value
      }));
    } catch (error) {
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
      {/* Configurações do Stripe */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Configurações de Pagamento</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chave Publicável do Stripe
            </label>
            <input
              type="text"
              value={settings.stripePublishableKey}
              onChange={(e) => handleSave('stripePublishableKey', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chave Secreta do Stripe
            </label>
            <input
              type="password"
              value={settings.stripeSecretKey}
              onChange={(e) => handleSave('stripeSecretKey', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chave do Webhook do Stripe
            </label>
            <input
              type="password"
              value={settings.stripeWebhookSecret}
              onChange={(e) => handleSave('stripeWebhookSecret', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Configurações do Período de Teste */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Período de Teste</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.trialEnabled}
                onChange={(e) => handleSave('trialEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                Ativar período de teste
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dias de teste
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={settings.trialDays}
              onChange={(e) => handleSave('trialDays', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Número de dias que o usuário poderá testar o sistema gratuitamente
            </p>
          </div>
        </div>
      </div>

      {/* Configurações de Email */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Configurações de Email</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Servidor SMTP
              </label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => handleSave('smtpHost', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Porta SMTP
              </label>
              <input
                type="text"
                value={settings.smtpPort}
                onChange={(e) => handleSave('smtpPort', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Usuário SMTP
              </label>
              <input
                type="text"
                value={settings.smtpUser}
                onChange={(e) => handleSave('smtpUser', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha SMTP
              </label>
              <input
                type="password"
                value={settings.smtpPass}
                onChange={(e) => handleSave('smtpPass', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email de Envio
            </label>
            <input
              type="email"
              value={settings.smtpFrom}
              onChange={(e) => handleSave('smtpFrom', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Configurações do Site */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Configurações do Site</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Domínio
            </label>
            <input
              type="text"
              value={settings.domain}
              onChange={(e) => handleSave('domain', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL da API
            </label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => handleSave('apiUrl', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};