import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';

// Esquema de validação mais rigoroso
const schema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const RegisterForm: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await signUp(data.email, data.password);
      showToast('success', 'Conta criada com sucesso! Por favor, faça login.');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      
      // Tratamento específico de erros do Supabase
      if (error.message?.includes('email')) {
        setError('email', { message: 'Este email já está em uso' });
      } else if (error.message?.includes('password')) {
        setError('password', { message: 'Senha inválida' });
      } else {
        showToast('error', 'Erro ao criar conta. Por favor, tente novamente.');
        setError('root', {
          message: 'Erro ao criar conta. Tente novamente.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Preencha os campos abaixo para criar sua conta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600 text-center">{errors.root.message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>

        <div className="mt-4 bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Requisitos da senha:</h3>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Mínimo de 8 caracteres</li>
            <li>Pelo menos uma letra maiúscula</li>
            <li>Pelo menos uma letra minúscula</li>
            <li>Pelo menos um número</li>
            <li>Pelo menos um caractere especial</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;