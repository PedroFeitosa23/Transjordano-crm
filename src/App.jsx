import React, { useState } from 'react';
import { LayoutDashboard, Briefcase, Users, Download, Plus, Search, ShieldCheck, ChevronDown } from 'lucide-react';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-transjordano-blue text-white flex flex-col justify-between" style={{ backgroundColor: '#1c2841' }}>
        <div>
          {/* Logo Area */}
          <div className="p-6 flex items-center justify-center border-b border-gray-700">
            <div className="text-center font-bold text-2xl tracking-wider flex items-center gap-2">
              <span className="text-transjordano-green" style={{ color: '#a3c339' }}>T</span>ransjordano
            </div>
          </div>
          
          {/* Menu */}
          <div className="p-4">
            <p className="text-xs text-gray-400 font-semibold mb-4 tracking-wider uppercase">Menu Principal</p>
            <nav className="space-y-2">
              <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'dashboard' ? 'bg-white/10 border-l-4 border-transjordano-green text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                <LayoutDashboard size={20} />
                <span className="font-medium">Dashboard & BI</span>
              </button>
              <button onClick={() => setActiveMenu('funil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'funil' ? 'bg-white/10 border-l-4 border-transjordano-green text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                <Briefcase size={20} />
                <span className="font-medium">Funil de Vendas</span>
              </button>
              <button onClick={() => setActiveMenu('leads')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'leads' ? 'bg-white/10 border-l-4 border-transjordano-green text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                <Users size={20} />
                <span className="font-medium">Leads & Contatos</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full flex items-center justify-between text-gray-300 hover:text-white transition-colors">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-transjordano-green" style={{ color: '#a3c339' }} />
              <span>Gerente</span>
            </div>
            <ChevronDown size={16} />
          </button>
          <div className="mt-4 text-center text-xs text-gray-500">
            Transjordano v1.0
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Analítico & Indicadores</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar clientes..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-transjordano-green focus:ring-1 focus:ring-transjordano-green text-sm w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
              <Download size={16} />
              Exportar Relatório
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium" style={{ backgroundColor: '#a3c339' }}>
              <Plus size={16} />
              Nova Oportunidade
            </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Cards */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4" style={{ borderLeftColor: '#a3c339' }}>
              <p className="text-sm font-semibold text-gray-500 mb-1">VALOR TOTAL NO FUNIL</p>
              <h2 className="text-3xl font-bold text-gray-800">R$ 0,00</h2>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-1">PREVISÃO (FORECAST)</p>
              <h2 className="text-3xl font-bold text-gray-800">R$ 0,00</h2>
              <p className="text-xs text-gray-400 mt-2">Ponderado pela probabilidade</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-1">NEGÓCIOS GANHOS</p>
              <h2 className="text-3xl font-bold text-gray-800">R$ 0,00</h2>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-1">TAXA DE CONVERSÃO</p>
              <h2 className="text-3xl font-bold text-gray-800">0%</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-center justify-center h-64 text-gray-400">
            <p>Área de gráficos e pipeline detalhado será renderizada aqui.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
