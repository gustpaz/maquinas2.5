import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plan } from '../types/subscription';
import {
  BarChart2,
  DollarSign,
  Key,
  Settings,
  TrendingDown,
  Shield,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Award,
  Zap,
  BarChart,
  PieChart,
  LineChart,
  TrendingUp,
  Headphones
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { useToast } from '../contexts/ToastContext';

const LandingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();

    // Inscrever-se para atualizações em tempo real
    const subscription = supabase
      .channel('plans_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'plans' 
      }, () => {
        fetchPlans();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleDemoAccess = async () => {
    try {
      setDemoLoading(true);
      // Simular login do usuário demo
      localStorage.setItem('isDemo', 'true');
      showToast('success', 'Bem-vindo à demonstração!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao acessar demo:', error);
      showToast('error', 'Erro ao acessar demonstração. Por favor, tente novamente mais tarde.');
    } finally {
      setDemoLoading(false);
    }
  };

  const features = [
    {
      icon: BarChart2,
      title: 'Análise Detalhada',
      description: 'Acompanhe o desempenho de cada máquina com gráficos e relatórios detalhados.'
    },
    {
      icon: DollarSign,
      title: 'Gestão Financeira',
      description: 'Controle custos fixos e variáveis, registre faturamentos e acompanhe a lucratividade.'
    },
    {
      icon: Key,
      title: 'API Integrada',
      description: 'Integre com outros sistemas através de nossa API REST completa e documentada.'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Seus dados protegidos com criptografia e controle de acesso granular.'
    },
    {
      icon: Smartphone,
      title: 'Responsivo',
      description: 'Acesse de qualquer dispositivo com nossa interface adaptativa.'
    },
    {
      icon: Settings,
      title: 'Personalizável',
      description: 'Adapte o sistema à sua marca com nossos recursos de white label.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">MachineManager</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
                Gerencie suas máquinas com eficiência
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Controle custos, monitore desempenho e maximize seus lucros com nossa plataforma completa de gestão
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  7 Dias Grátis - Comece Agora
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <button
                  onClick={handleDemoAccess}
                  disabled={demoLoading}
                  className={`
                    inline-flex items-center justify-center px-8 py-3 border-2 border-white 
                    text-lg font-medium rounded-md text-white hover:bg-white hover:text-blue-600
                    transition-colors duration-200 ease-in-out
                    ${demoLoading ? 'opacity-75 cursor-not-allowed' : ''}
                  `}
                >
                  {demoLoading ? 'Carregando...' : 'Ver Demonstração'}
                </button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-blue-100">Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">10k+</div>
                  <div className="text-blue-100">Máquinas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">99%</div>
                  <div className="text-blue-100">Satisfação</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://placehold.co/600x400/2563eb/FFFFFF/png?text=Dashboard+Preview"
                alt="Dashboard Preview"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={32} />
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Clientes Ativos</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-600" size={32} />
              <div>
                <div className="text-2xl font-bold text-gray-900">30%</div>
                <div className="text-gray-600">Aumento em Lucros</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-purple-50 rounded-lg">
              <Clock className="text-purple-600" size={32} />
              <div>
                <div className="text-2xl font-bold text-gray-900">5h</div>
                <div className="text-gray-600">Economia/Semana</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-yellow-50 rounded-lg">
              <Award className="text-yellow-600" size={32} />
              <div>
                <div className="text-2xl font-bold text-gray-900">99%</div>
                <div className="text-gray-600">Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-gray-600 text-lg">
              Uma plataforma completa para gerenciar suas máquinas, controlar custos e maximizar resultados
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
            <p className="text-gray-600 text-lg">
              Comece a usar o MachineManager em 3 passos simples
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cadastre-se</h3>
              <p className="text-gray-600">
                Crie sua conta gratuitamente e configure seu perfil
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Adicione Máquinas</h3>
              <p className="text-gray-600">
                Cadastre suas máquinas e comece a registrar operações
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Acompanhe Resultados</h3>
              <p className="text-gray-600">
                Visualize relatórios e tome decisões baseadas em dados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Identifique Máquinas Lucrativas e Problemáticas
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Análise de Lucratividade</h3>
                    <p className="text-gray-600">
                      Descubra quais máquinas estão gerando mais lucro e quais precisam de atenção com análises detalhadas de receitas e custos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <TrendingDown className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Alerta de Prejuízos</h3>
                    <p className="text-gray-600">
                      Receba alertas quando uma máquina começar a dar prejuízo e identifique rapidamente as causas do problema
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <BarChart className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Comparativo de Performance</h3>
                    <p className="text-gray-600">
                      Compare o desempenho entre máquinas e períodos para identificar padrões e oportunidades de melhoria
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://placehold.co/600x400/2563eb/FFFFFF/png?text=Análise+de+Lucratividade"
                alt="Análise de Lucratividade"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Análises Poderosas para Decisões Inteligentes
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BarChart className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Gráficos Detalhados</h3>
                    <p className="text-gray-600">
                      Visualize o desempenho de cada máquina com gráficos interativos e rankings de lucratividade
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <PieChart className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Distribuição de Custos</h3>
                    <p className="text-gray-600">
                      Entenda a composição dos custos de cada máquina e identifique onde otimizar para aumentar a lucratividade
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <LineChart className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Tendências e Projeções</h3>
                    <p className="text-gray-600">
                      Acompanhe tendências de lucro e faça projeções para tomar decisões estratégicas sobre cada máquina
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <img
                src="https://placehold.co/600x400/2563eb/FFFFFF/png?text=Analytics+Preview"
                alt="Analytics Preview"
                className="rounded-lg shadow-xl"
              />
            </div>
         </div>
       </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">O que nossos clientes dizem</h2>
            <p className="text-gray-600 text-lg">
              Histórias reais de empresas que transformaram sua gestão com o MachineManager
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://placehold.co/100/2563eb/FFFFFF/png?text=JD"
                  alt="João Silva"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">João Silva</h3>
                  <p className="text-gray-600">Diretor Industrial</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Identificamos rapidamente quais máquinas estavam dando prejuízo e conseguimos reverter a situação. Reduzimos custos em 25% e aumentamos o lucro em 40%."
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://placehold.co/100/2563eb/FFFFFF/png?text=MS"
                  alt="Maria Santos"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">Maria Santos</h3>
                  <p className="text-gray-600">Gerente de Produção</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Os relatórios de lucratividade por máquina nos ajudaram a focar nossos esforços onde realmente importa. Agora sabemos exatamente onde investir."
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://placehold.co/100/2563eb/FFFFFF/png?text=CP"
                  alt="Carlos Pereira"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">Carlos Pereira</h3>
                  <p className="text-gray-600">Empresário</p>
                </div>
              </div>
              <p className="text-gray-600">
                "O suporte é excepcional e as atualizações constantes mostram que a equipe está sempre pensando em melhorias."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-gray-600 text-lg">
              Planos flexíveis que crescem com seu negócio
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <p className="text-3xl font-bold text-blue-600 mb-6">
                      {formatCurrency(plan.price)}
                      <span className="text-base font-normal text-gray-500">/mês</span>
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 mr-2" size={20} />
                        <span>
                          {plan.features.machines === -1 
                            ? 'Máquinas ilimitadas'
                            : `${plan.features.machines} máquinas`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 mr-2" size={20} />
                        <span>Relatórios {plan.features.reports ? 'avançados' : 'básicos'}</span>
                      </div>
                      {plan.features.api_access && (
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2" size={20} />
                          <span>Acesso à API</span>
                        </div>
                      )}
                      {plan.features.white_label && (
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500 mr-2" size={20} />
                          <span>White Label</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to="/register"
                      className="block w-full text-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Começar com {plan.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Pronto para transformar sua gestão?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Comece agora mesmo com nosso período de teste gratuito de 14 dias
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                  >
                    7 Dias Grátis - Criar Conta
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-lg font-medium rounded-md text-white hover:bg-white hover:text-blue-600"
                  >
                    <Headphones className="mr-2" size={20} />
                    Falar com Consultor
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <img
                  src="https://placehold.co/400x300/2563eb/FFFFFF/png?text=Start+Now"
                  alt="Start Now"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;