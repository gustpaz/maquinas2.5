import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft,
  BarChart2,
  DollarSign,
  List,
  PlusCircle,
  Receipt,
  Key,
  FileText
} from 'lucide-react';

interface Step {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

export const DemoTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      title: 'Dashboard',
      description: 'Veja uma visão geral do desempenho das suas máquinas, com gráficos e indicadores importantes. Monitore receitas, custos e lucros em tempo real.',
      path: '/dashboard',
      icon: <BarChart2 className="text-blue-600" size={24} />
    },
    {
      title: 'Adicionar Máquina',
      description: 'Cadastre suas máquinas no sistema para começar a acompanhar seus custos e faturamentos. Você pode adicionar quantas máquinas precisar.',
      path: '/adicionar-maquina',
      icon: <PlusCircle className="text-blue-600" size={24} />
    },
    {
      title: 'Transações',
      description: 'Registre custos e faturamentos para cada máquina. Você pode adicionar, editar e excluir transações facilmente.',
      path: '/transacoes',
      icon: <Receipt className="text-blue-600" size={24} />
    },
    {
      title: 'Custos Fixos',
      description: 'Gerencie custos fixos mensais como aluguel, manutenção e outros. Estes custos são considerados nos cálculos de lucratividade.',
      path: '/custos-fixos',
      icon: <FileText className="text-blue-600" size={24} />
    },
    {
      title: 'Análise Financeira',
      description: 'Analise o desempenho financeiro detalhado de cada máquina com gráficos, relatórios e comparativos de lucratividade.',
      path: '/analise',
      icon: <DollarSign className="text-blue-600" size={24} />
    },
    {
      title: 'API e Integrações',
      description: 'Integre o sistema com outras ferramentas através da nossa API REST. Gere chaves de API e acesse a documentação completa.',
      path: '/api',
      icon: <Key className="text-blue-600" size={24} />
    }
  ];

  useEffect(() => {
    // Verificar se é a primeira vez que o usuário acessa o tutorial
    const tutorialShown = localStorage.getItem('demoTutorialShown');
    if (tutorialShown) {
      setIsOpen(false);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      navigate(steps[currentStep + 1].path);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      navigate(steps[currentStep - 1].path);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('demoTutorialShown', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-lg">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {steps[currentStep].icon}
          <h3 className="text-lg font-semibold text-gray-800">
            {steps[currentStep].title}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          {steps[currentStep].description}
        </p>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md
              ${currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full
                  ${index === currentStep ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};