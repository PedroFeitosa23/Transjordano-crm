import React from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-white p-6 rounded-xl shadow-card border border-gray-100', className)} {...props}>
      {children}
    </div>
  );
}