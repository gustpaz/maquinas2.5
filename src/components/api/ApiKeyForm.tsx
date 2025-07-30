import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { Copy } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  expiresAt: z.string().optional()
});

type FormData = z.infer<typeof schema>;

interface ApiKeyFormProps {
  onKeyCreated: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onKeyCreated }) => {
  const { showToast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast('success', 'Chave copiada para a área de transferência!');
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar chave aleatória
      const key = crypto.randomUUID().replace(/-/g, '');

      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: data.name,
          key,
          expires_at: data.expiresAt || null
        });

      if (error) throw error;

      // Mostrar modal com a chave
      const modalContent = (
        <div className="flex items-center gap-2">
          <code className="bg-gray-100 px-2 py-1 rounded">{key}</code>
          <button
            onClick={() => handleCopyKey(key)}
            className="text-blue-600 hover:text-blue-800"
            title="Copiar chave"
          >
            <Copy size={20} />
          </button>
        </div>
      );

      showToast('success', 'Chave de API criada com sucesso!', {
        duration: 10000,
        content: modalContent
      });

      reset();
      onKeyCreated(); // Atualizar lista de chaves
    } catch (error) {
      showToast('error', 'Erro ao criar chave de API');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome da Chave
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="Ex: Integração ERP"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
          Data de Expiração (opcional)
        </label>
        <input
          {...register('expiresAt')}
          type="date"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Gerar Nova Chave
      </button>
    </form>
  );
};

export default ApiKeyForm;