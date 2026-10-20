import React from 'react';
import { cn } from '@/lib/cn';
import { Link } from 'react-router-dom';

export function Logo({ className, compact = false }) {
  return (
    <Link 
      to="/" 
      className={cn(
        'flex items-center select-none hover:opacity-80 transition-opacity duration-200 cursor-pointer', 
        className
      )}
      title="Voltar ao Início"
    >
      <img 
        src="/image_84cc9b.png" 
        alt="Transjordano" 
        className={cn(
          "object-contain w-auto", 
          compact ? "h-10" : "h-14 md:h-16"
        )}
      />
    </Link>
  );
}
