import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Sessão iniciada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao entrar. Verifique o e-mail e a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002b5c]">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-2xl font-black text-[#002b5c] tracking-tight">TRANSJORDANO</h1>
          <p className="text-[10px] text-[#A3C43B] font-bold uppercase tracking-widest mt-1">Segurança em Movimento</p>
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Acesso ao CRM</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Introduza as suas credenciais para entrar no sistema</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#002b5c] focus:ring-1 focus:ring-[#002b5c] transition-all"
              placeholder="seu.email@transjordano.com.br"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Senha</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#002b5c] focus:ring-1 focus:ring-[#002b5c] transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#002b5c] hover:bg-[#001a38] text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'A validar credenciais...' : 'Entrar no Sistema'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-400 font-medium border-t border-gray-100 pt-4">
          Transjordano Transportes & Logística © 2026
        </div>
      </div>
    </div>
  );
}
