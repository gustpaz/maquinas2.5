import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiresSubscription = true }) => {
  const { user, loading, trialExpired } = useAuth();
  const isDemo = localStorage.getItem('isDemo') === 'true';
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Permitir acesso se for demo ou usuário autenticado
  if (!user && !isDemo) {
    return <Navigate to="/login" />;
  }

  // Se a rota requer assinatura e o trial expirou, redirecionar para planos
  if (requiresSubscription && trialExpired && !isDemo) {
    return <Navigate to="/planos" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;