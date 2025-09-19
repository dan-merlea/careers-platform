import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  icon, 
  className = '' 
}) => {
  return (
    <div className={`bg-gray-50 p-4 rounded-md border border-gray-200 text-center ${className}`}>
      {icon && <div className="flex justify-center mb-2">{icon}</div>}
      {!icon && <ExclamationCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />}
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default EmptyState;
