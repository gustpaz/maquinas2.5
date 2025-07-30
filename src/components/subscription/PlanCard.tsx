import React from 'react';
import { Plan } from '../../types/subscription';
import { Check } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan,
  onSelect
}) => {
  const features = [
    {
      label: 'Máquinas',
      value: plan.features.machines === -1 ? 'Ilimitadas' : `${plan.features.machines} máquinas`
    },
    {
      label: 'Relatórios',
      value: plan.features.reports ? 'Incluído' : 'Não incluído'
    },
    {
      label: 'Acesso à API',
      value: plan.features.api_access ? 'Incluído' : 'Não incluído'
    },
    {
      label: 'White Label',
      value: plan.features.white_label ? 'Incluído' : 'Não incluído'
    }
  ];

  return (
    <div className={`
      bg-white p-6 rounded-lg shadow-sm border
      ${isCurrentPlan ? 'border-blue-500' : 'border-gray-100'}
    `}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
        <p className="text-gray-500 mt-2">{plan.description}</p>
        <p className="text-3xl font-bold text-gray-900 mt-4">
          {formatCurrency(plan.price)}
          <span className="text-base font-normal text-gray-500">/mês</span>
        </p>
      </div>

      <ul className="space-y-4 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check 
              size={20} 
              className={feature.value === 'Não incluído' ? 'text-gray-300' : 'text-green-500'} 
            />
            <span className="ml-3 text-gray-600">
              {feature.label}: {feature.value}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        className={`
          w-full py-2 px-4 rounded-md font-medium
          ${isCurrentPlan
            ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'}
        `}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? 'Plano Atual' : 'Selecionar Plano'}
      </button>
    </div>
  );
};