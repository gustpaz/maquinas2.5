import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarLinkProps {
  icon: React.ReactNode;
  text: string;
  path: string;
  isActive: boolean;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  text,
  path,
  isActive
}) => {
  return (
    <li>
      <Link
        to={path}
        className={`
          w-full flex items-center space-x-3 p-3 rounded-lg
          ${isActive
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
          }
          transition-colors
        `}
      >
        {icon}
        <span>{text}</span>
      </Link>
    </li>
  );
};