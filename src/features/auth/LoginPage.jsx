import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Logo } from '@/components/ui/Logo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleLogin = (uid) => {
    login(uid);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Logo className="text-transjordano-blue-900 justify-center" />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10 text-center">
          <h2 className="text-xl font-medium mb-6">Acesso ao Sistema (Mock)</h2>
          <div className="flex flex-col gap-4">
            <Button onClick={() => handleLogin('u1')} className="w-full justify-center">Entrar como Gerente (Admin Silva)</Button>
            <Button onClick={() => handleLogin('u2')} variant="secondary" className="w-full justify-center">Entrar como Vendedor (Souza)</Button>
          </div>
          <p className="mt-6 text-xs text-gray-500">O sistema está configurado para testes de permissão e UI.</p>
        </Card>
      </div>
    </div>
  );
}
