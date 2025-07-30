import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import { Layout } from './components/Layout';
import Dashboard from './components/Dashboard';
import AddMachineForm from './components/forms/AddMachineForm';
import MachineList from './components/MachineList';
import TransactionForm from './components/forms/TransactionForm';
import AnalysisDashboard from './components/analysis/AnalysisDashboard';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import FixedCostsPage from './components/FixedCosts/FixedCostsPage';
import FixedCostsList from './components/FixedCosts/FixedCostsList';
import TransactionsPage from './components/transactions/TransactionsPage';
import UserSettings from './components/settings/UserSettings';
import ApiPage from './components/api/ApiPage';
import PlansPage from './components/subscription/PlansPage';
import AdminDashboard from './components/admin/AdminDashboard';

interface PrivateRouteWithRoleProps {
  children: React.ReactNode;
  allowDemo?: boolean;
}

const PrivateRouteWithRole: React.FC<PrivateRouteWithRoleProps> = ({ children, allowDemo = true }) => {
  const isDemo = localStorage.getItem('isDemo') === 'true';
  
  // Se for demo e a rota não permite demo, redirecionar para dashboard
  if (isDemo && !allowDemo) {
    return <Navigate to="/dashboard" />;
  }
  
  return <PrivateRoute>{children}</PrivateRoute>;
};

function App() {
  const isDemo = localStorage.getItem('isDemo') === 'true';

  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={isDemo ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/planos" element={
              <PrivateRoute requiresSubscription={false}>
                <Layout>
                  <PlansPage />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/adicionar-maquina" element={
              <PrivateRoute>
                <Layout>
                  <AddMachineForm />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/listar-maquinas" element={
              <PrivateRoute>
                <Layout>
                  <MachineList />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/registrar-custo" element={
              <PrivateRoute>
                <Layout>
                  <TransactionForm type="cost" />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/registrar-faturamento" element={
              <PrivateRoute>
                <Layout>
                  <TransactionForm type="revenue" />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/transacoes" element={
              <PrivateRoute>
                <Layout>
                  <TransactionsPage />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/custos-fixos" element={
              <PrivateRoute>
                <Layout>
                  <FixedCostsPage />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/custos-fixos-lista" element={
              <PrivateRoute>
                <Layout>
                  <FixedCostsList />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/analise" element={
              <PrivateRoute>
                <Layout>
                  <AnalysisDashboard />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/configuracoes" element={
              <PrivateRoute>
                <Layout>
                  <UserSettings />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/api" element={
              <PrivateRoute>
                <Layout>
                  <ApiPage />
                </Layout>
              </PrivateRoute>
            } />

           <Route path="/planos" element={
             <PrivateRoute>
               <Layout>
                 <PlansPage />
               </Layout>
             </PrivateRoute>
           } />

            <Route path="/admin" element={
              <PrivateRouteWithRole allowDemo={false}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </PrivateRouteWithRole>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;