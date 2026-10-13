import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { currencyBRL, percent, dateBR, compactBRL } from '@/lib/format';
import { opportunitiesRepo, stagesRepo, quotasRepo } from '@/services/repositories';
import { calcValorTotalFunil, calcForecast, calcNegociosGanhos, calcTaxaConversao } from './kpis';
import { BarChart3, TrendingUp, AlertCircle, Clock, Target, Trophy, Filter } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/features/auth/can';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ opps: [], stages: [], quota: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const filters = can(user, 'view:all_opportunities') ? {} : { ownerId: user.uid };
        const opps = await opportunitiesRepo.list(filters);
        const stages = await stagesRepo.list();
        const quotas = await quotasRepo.list();
        const userQuota = quotas.find(q => q.id === user.uid) || { targetCents: 0 };
        setData({ opps, stages, quota: userQuota });
      } finally { setLoading(false); }
    }
    loadData();
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-32 bg-gray-200 rounded-xl"></div><div className="h-64 bg-gray-200 rounded-xl"></div></div>;

  const total = calcValorTotalFunil(data.opps);
  const forecast = calcForecast(data.opps, data.stages);
  const ganhos = calcNegociosGanhos(data.opps);
  const conversao = calcTaxaConversao(data.opps);
  const metaAtingida = data.quota.targetCents > 0 ? (ganhos / data.quota.targetCents) * 100 : 0;

  const openOpps = data.opps.filter(o => o.status === 'open');
  const funilData = data.stages.filter(s => s.kind === 'open').map(stage => {
    const stageOpps = openOpps.filter(o => o.stageId === stage.id);
    return { name: stage.name, order: stage.order, valor: stageOpps.reduce((acc, o) => acc + o.valueCents, 0) };
  }).sort((a,b) => a.order - b.order);

  const fourteenDaysAgo = new Date(); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const paradas = openOpps.filter(o => new Date(o.stageChangedAt) < fourteenDaysAgo);

  return (
    <div className="space-y-6">
      {/* Fase 2: Global Period Selector Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <div>
           <h2 className="text-lg font-semibold text-gray-800">Visão Geral</h2>
           <p className="text-xs text-gray-500">Métricas comerciais baseadas no pipeline</p>
         </div>
         <button onClick={()=>toast.info("Seletor de período ativado em breve")} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <Filter size={14}/> Trimestre Atual (Q4 2026)
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-transjordano-green-500">
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Valor Total Aberto</p>
          <h2 className="text-2xl font-bold text-gray-900 tabular">{currencyBRL(total)}</h2>
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><TrendingUp size={12}/> Pipeline total</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Forecast</p>
          <h2 className="text-2xl font-bold text-gray-900 tabular">{currencyBRL(forecast)}</h2>
          <p className="text-[10px] text-gray-400 mt-2">Ponderado por prob.</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Ganhos (YTD)</p>
          <h2 className="text-2xl font-bold text-emerald-600 tabular">{currencyBRL(ganhos)}</h2>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Conversão</p>
          <h2 className="text-2xl font-bold text-gray-900 tabular">{percent(conversao)}</h2>
        </Card>
        {/* Fase 3: Meta do Vendedor/Equipa */}
        <Card className="bg-transjordano-blue-900 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10"><Target size={48}/></div>
          <p className="text-xs font-semibold text-transjordano-blue-200 mb-1 uppercase tracking-wide">Atingimento Meta</p>
          <h2 className="text-2xl font-bold text-white tabular">{percent(metaAtingida)}</h2>
          <div className="w-full bg-transjordano-blue-950 rounded-full h-1.5 mt-3"><div className="bg-transjordano-green h-1.5 rounded-full" style={{width: `${Math.min(metaAtingida, 100)}%`}}></div></div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2"><BarChart3 size={18}/> Valor em Aberto por Etapa</h3>
          <div className="h-72">
            {funilData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funilData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={(val) => compactBRL(val)} stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="name" type="category" width={100} stroke="#4b5563" fontSize={12} />
                  <RechartsTooltip formatter={(val) => currencyBRL(val)} cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="valor" fill="#a3c339" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState title="Sem dados" description="Nenhuma oportunidade." icon={BarChart3} />}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="h-full">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-amber-600"><AlertCircle size={18}/> Alertas de Pipeline</h3>
            {paradas.length > 0 ? (
              <ul className="space-y-3">
                {paradas.map(o => (
                  <li key={o.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg flex flex-col gap-1">
                    <span className="font-medium text-sm text-gray-800 truncate">{o.title}</span>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="text-gray-900 font-semibold">{compactBRL(o.valueCents)}</span>
                      <span className="flex items-center gap-1 text-amber-700 font-medium"><Clock size={12}/> Parado há 14+ dias</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed border-gray-100 rounded-lg">Nenhum alerta crítico.</div>}
          </Card>
        </div>
      </div>
      
      {/* FASE 3: Ranking de Vendedores (Apenas Manager) */}
      {user.role === 'manager' && (
        <Card>
           <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Trophy size={18} className="text-amber-500"/> Ranking de Vendas (Neste Trimestre)</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50 text-gray-700 text-xs uppercase border-b border-gray-200">
                 <tr><th className="px-4 py-3">Vendedor</th><th className="px-4 py-3">Negócios Ganhos</th><th className="px-4 py-3 text-right">Valor Gerado</th></tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 <tr><td className="px-4 py-3 font-medium text-gray-900">Souza</td><td className="px-4 py-3">1</td><td className="px-4 py-3 text-right text-emerald-600 font-semibold">{compactBRL(5000000)}</td></tr>
                 <tr><td className="px-4 py-3 font-medium text-gray-900">Admin Silva</td><td className="px-4 py-3">0</td><td className="px-4 py-3 text-right font-semibold">{compactBRL(0)}</td></tr>
               </tbody>
             </table>
           </div>
        </Card>
      )}
    </div>
  );
}