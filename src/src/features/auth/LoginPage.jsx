import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEnter = () => {
    login();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#002b5c] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-100 text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6 flex justify-center w-full">
            <Logo className="w-full max-w-[240px] mb-2" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">Acesso ao CRM</h2>
          <p className="text-xs text-gray-500">Clique abaixo para entrar no sistema operacional</p>
        </div>

        <Button onClick={handleEnter} className="w-full bg-transjordano-blue-900 hover:bg-transjordano-blue-950 text-white py-3 rounded-lg font-medium transition-colors">
          Entrar no Sistema
        </Button>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Transjordano Transportes & Logística © 2026</p>
        </div>
      </div>
    </div>
  );
}
