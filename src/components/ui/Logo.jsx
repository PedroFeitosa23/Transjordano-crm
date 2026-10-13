import React from 'react';
import { cn } from '@/lib/cn';

export function Logo({ className }) {
  return (
    <div className={cn("text-center font-bold text-2xl tracking-wider flex items-center gap-2 text-white", className)}>
      <span className="text-transjordano-green">T</span>ransjordano
    </div>
  );
}