import React from 'react';
import logoImg from '@/assets/transjordano_logo.jpg';

export function Logo({ className = "", compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoImg} 
        alt="Transjordano Logo" 
        className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0 border border-transjordano-blue-800" 
      />
      {!compact && (
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-gray-900 leading-tight">TRANSJORDANO</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">CRM Logístico</span>
        </div>
      )}
    </div>
  );
}
