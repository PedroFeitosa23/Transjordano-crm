import React from 'react'; 
import { cn } from '@/lib/cn'; 

export function Logo({ className }) { 
  return (
    <div className={cn('flex items-center gap-2.5 md:gap-3 select-none', className)}>
      {/* Símbolo Logístico - Réplica do Ícone Verde */}
      <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-[46px] md:h-[46px] shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 28 C 30 25 45 35 52 48 L 40 55 C 32 42 20 38 10 40 Z" fill="#a3c339" />
        <path d="M15 75 C 25 60 40 52 55 52 L 55 65 C 42 65 30 72 25 82 Z" fill="#a3c339" />
        <path d="M58 20 C 65 35 62 55 50 68 L 38 60 C 48 50 50 35 45 22 Z" fill="#a3c339" />
      </svg>
      
      <div className="flex flex-col justify-center items-start pt-1">
        <span 
          className="font-black text-[22px] md:text-[28px] tracking-[-0.05em] leading-none uppercase" 
          style={{ fontFamily: '"Arial Black", "Montserrat", "Impact", sans-serif' }}
        >
          Transjordano
        </span>
        <span 
          className="text-transjordano-green-500 font-bold text-[9px] md:text-[12px] leading-tight tracking-[0.02em] mt-0.5"
          style={{ fontFamily: '"Arial", "Inter", sans-serif' }}
        >
          Segurança em Movimento
        </span>
      </div>
    </div>
  ); 
}
