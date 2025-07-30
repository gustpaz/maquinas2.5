import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon: Icon,
  isLoading,
  className = '',
  ...props
}) => {
  const baseStyles = 'flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : Icon && (
        <Icon className="mr-2" size={20} />
      )}
      {children}
    </button>
  );
};