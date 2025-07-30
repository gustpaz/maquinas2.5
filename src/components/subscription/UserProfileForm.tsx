import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMachineStore } from '../../store/useMachineStore';
import { useToast } from '../../contexts/ToastContext';

const schema = z.object({
  companyName: z.string().min(1, 'Nome da empresa é obrigatório'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional()
  })
});

type FormData = z.infer<typeof schema>;

const UserProfileForm: React.FC = () => {
  const { userProfile, updateProfile } = useMachineStore();
  const { showToast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: userProfile?.companyName || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || {}
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateProfile(data);
      showToast('success', 'Perfil atualizado com sucesso!');
    } catch (error) {
      showToast('error', 'Erro ao atualizar perfil');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          Nome da Empresa
        </label>
        <input
          {...register('companyName')}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <input
          {...register('phone')}
          type="tel"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Endereço</h3>
        
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Rua
          </label>
          <input
            {...register('address.street')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              {...register('address.city')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <input
              {...register('address.state')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              País
            </label>
            <input
              {...register('address.country')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              CEP
            </label>
            <input
              {...register('address.zipCode')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Salvar Alterações
      </button>
    </form>
  );
};

export default UserProfileForm;