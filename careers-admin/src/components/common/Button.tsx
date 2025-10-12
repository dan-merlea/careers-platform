import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'white' | 'outline' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className,
  children,
  fullWidth,
  leadingIcon,
  ...rest
}) => {
  const base = [
    'inline-flex items-center justify-center',
    'h-[38px] px-4 rounded-md text-sm font-medium',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : 'w-auto',
  ].join(' ');

  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent focus:ring-blue-500'
      : variant === 'secondary'
      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 focus:ring-gray-400'
      : variant === 'outline'
      ? 'bg-transparent text-blue-600 hover:bg-blue-50 border border-blue-500 focus:ring-blue-500'
      : variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 border border-transparent focus:ring-red-500'
      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-indigo-500';

  return (
    <button className={[base, variantClasses, className || ''].join(' ')} {...rest}>
      {leadingIcon ? <span className="mr-2 flex items-center">{leadingIcon}</span> : null}
      {children}
    </button>
  );
};

export default Button;
