// components/SectionCard.tsx
'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  badge?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ badge, title, description, children, className }: SectionCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        {badge && (
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {badge}
          </div>
        )}
        <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-6 pt-0">
        {children}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, required, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}