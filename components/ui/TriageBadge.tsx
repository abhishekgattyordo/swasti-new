// components/TriageBadge.tsx
'use client';

import { cn } from '@/lib/utils';

interface TriageBadgeProps {
  value?: 'Red' | 'Yellow' | 'Green' | '';
}

export function TriageBadge({ value }: TriageBadgeProps) {
  if (!value) return null;
  
  const config = {
    Red: {
      text: 'Critical',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200'
    },
    Yellow: {
      text: 'Observation',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200'
    },
    Green: {
      text: 'Stable',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200'
    }
  };
  
  const { text, className } = config[value];
  
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border", className)}>
      {value} — {text}
    </span>
  );
}