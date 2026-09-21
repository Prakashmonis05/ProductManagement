import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-xl p-5 shadow-sm transition-all duration-200',
        hover && 'hover:shadow-md hover:border-slate-300 dark:hover:border-gray-700 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
