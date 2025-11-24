import React from 'react';
import { BaseComponentProps } from '../../types';

interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  className = '', 
  variant = 'default',
  padding = 'md',
  children 
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border-[1.5px] border-gray-200 dark:border-gray-700 shadow-md',
    glass: 'bg-white/90 dark:bg-gray-800/70 backdrop-blur-md border-[1.5px] border-gray-200/50 dark:border-white/10 shadow-lg',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
};
