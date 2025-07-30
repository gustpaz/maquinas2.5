import React from 'react';
import { Machine } from '../../types/machine';

interface StatusBadgeProps {
  status: Machine['status'];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    active: {
      text: 'Ativa',
      color: 'text-green-600'
    },
    maintenance: {
      text: 'Manutenção',
      color: 'text-yellow-600'
    },
    inactive: {
      text: 'Inativa',
      color: 'text-red-600'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={config.color}>
      {config.text}
    </span>
  );
};