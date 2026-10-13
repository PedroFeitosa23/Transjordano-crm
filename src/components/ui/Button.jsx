import React from 'react';
import { cn } from '@/lib/cn';
export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-transjordano-green-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-transjordano-green hover:bg-transjordano-green-400 text-transjordano-blue-900',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent hover:bg-black/5 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 py-2 text-sm', lg: 'h-12 px-6 py-3 text-base' };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props}>{children}</button>;
}