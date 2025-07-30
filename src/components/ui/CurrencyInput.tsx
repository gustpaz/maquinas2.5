import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  label?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  error,
  label,
  className = '',
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Formata o valor inicial
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove todos os caracteres não numéricos
    const numericValue = e.target.value.replace(/\D/g, '');
    
    // Converte para número decimal (divide por 100 para considerar os centavos)
    const numberValue = Number(numericValue) / 100;
    
    // Atualiza o valor formatado no input
    setDisplayValue(formatCurrency(numberValue));
    
    // Chama o callback com o valor numérico
    onChange(numberValue);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          R$
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={`
            pl-8 block w-full rounded-md border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            ${error ? 'border-red-300' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};