import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white/50 border border-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
