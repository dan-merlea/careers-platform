import React from 'react';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ariaLabel?: string;
  variant?: 'default' | 'dark';
}

const DateInput: React.FC<DateInputProps> = ({ className, ariaLabel, variant = 'default', ...rest }) => {
  const base = 'w-full box-border h-[38px] px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50';
  const tone =
    variant === 'dark'
      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';
  return (
    <input
      type="date"
      aria-label={ariaLabel}
      {...rest}
      className={[base, tone, className || ''].join(' ')}
    />
  );
};

export default DateInput;
