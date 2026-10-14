import React from 'react';
import { cn } from '@/lib/cn';

export function Logo({ className, compact = false }) {
  return (
    <div className={cn('flex items-center select-none', compact ? 'gap-2' : 'gap-3 md:gap-4', className)}>
      {/* Símbolo Vetorial (As 3 vias rodoviárias verdes) */}
      <svg 
        viewBox="0 0 100 100" 
        className={cn("shrink-0", compact ? "w-8 h-8" : "w-12 h-12 md:w-16 md:h-16")} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#8cc63f" strokeWidth="8" strokeLinecap="round" fill="none">
          {/* Curvas da Esquerda */}
          <path d="M5 25 Q 35 35 45 55" />
          <path d="M15 10 Q 50 20 60 45" />
          {/* Curvas da Direita */}
          <path d="M95 25 Q 65 35 55 55" />
          <path d="M85 10 Q 50 20 40 45" />
          {/* Curvas da Base */}
          <path d="M35 95 Q 50 65 30 50" />
          <path d="M65 95 Q 50 65 70 50" />
        </g>
      </svg>

      {/* Bloco de Texto */}
      <div className="flex flex-col justify-center w-full">
        <span 
          className={cn(
            "font-black leading-none uppercase text-[#002b5c]", 
            compact ? "text-[22px] tracking-tighter" : "text-[30px] md:text-[38px] tracking-[-0.05em]"
          )}
          style={{ fontFamily: '"Arial Black", "Montserrat", "Impact", sans-serif' }}
        >
          Transjordano
        </span>
        <span 
          className={cn(
            "text-[#8cc63f] font-semibold leading-tight text-right w-full", 
            compact ? "text-[9px] mt-0.5" : "text-[12px] md:text-[15px] mt-1 tracking-wide"
          )}
          style={{ fontFamily: '"Arial", "Helvetica", sans-serif' }}
        >
          Segurança em Movimento
        </span>
      </div>
    </div>
  );
}
