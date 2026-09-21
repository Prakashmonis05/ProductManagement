import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ children, variant = 'default', size = 'md', className }) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide';

  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    primary: 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-800',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'TODO':
    case 'PLANNING':
      return <Badge variant="default">{status.replace('_', ' ')}</Badge>;
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return <Badge variant="info">In Progress</Badge>;
    case 'REVIEW':
    case 'ON_HOLD':
      return <Badge variant="warning">{status === 'REVIEW' ? 'In Review' : 'On Hold'}</Badge>;
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'ARCHIVED':
      return <Badge variant="default">Archived</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case 'LOW':
      return <Badge variant="default">Low</Badge>;
    case 'MEDIUM':
      return <Badge variant="info">Medium</Badge>;
    case 'HIGH':
      return <Badge variant="warning">High</Badge>;
    case 'CRITICAL':
      return <Badge variant="danger">Critical</Badge>;
    default:
      return <Badge variant="default">{priority}</Badge>;
  }
};
