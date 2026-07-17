import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

const shadowClasses: Record<NonNullable<CardProps['shadow']>, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export function Card({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  border = true,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white',
        paddingClasses[padding],
        shadowClasses[shadow],
        border && 'border border-gray-200',
        className,
      )}
    >
      {children}
    </div>
  );
}
