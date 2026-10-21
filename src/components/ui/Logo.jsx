import React from 'react';
import logoImg from '@/assets/logo-transjordano.webp';

export function Logo({ className = "", compact = false }) {
  // Se for compact (sidebar fechada/mobile drawer top), podemos querer mostrar a imagem mas limitar a largura
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoImg} 
        alt="Transjordano Logo" 
        className={compact ? "h-8 w-auto object-contain" : "h-12 w-auto object-contain"} 
      />
    </div>
  );
}
