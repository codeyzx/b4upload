import React, { InputHTMLAttributes, forwardRef } from 'react';
import { BaseComponentProps } from '../../types';

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseComponentProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl
              border-[1.5px] border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              transition-all duration-200
              hover:border-gray-400 dark:hover:border-gray-600
              focus:outline-none focus:border-2 focus:border-indigo-500
              focus:ring-[3px] focus:ring-indigo-500/15
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-12' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
