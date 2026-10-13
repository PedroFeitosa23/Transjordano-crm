import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { currencyBRL, percent, dateBR } from '@/lib/format';
import { opportunitiesRepo, stagesRepo } from '@/services/repositories';
import { calcValorTotalFunil, calcForecast, calcNegociosGanhos, calcTaxaConversao } from './kpis';
import { BarChart3, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/features/auth/can';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ opps: [], stages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const filters = can(user, 'view:all_opportunities') ? {} : { ownerId: user.uid };
        const opps = await opportunitiesRepo.list(filters);
        const stages = await stagesRepo.list();
        setData({ opps, stages });
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-32 bg-gray-200 rounded-xl"></div><div className="h-64 bg-gray-200 rounded-xl"></div></div>;

  const total = calcValorTotalFunil(data.opps);
  const forecast = calcForecast(data.opps, data.stages);
  const ganhos = calcNegociosGanhos(data.opps);
  const conversao = calcTaxaConversao(data.opps);

  const openOpps = data.opps.filter(o => o.status === 'open');
  const funilData = data.stages.filter(s => s.kind === 'open').map(stage => {
    const stageOpps = openOpps.filter(o => o.stageId === stage.id);
    return { name: stage.name, valor: stageOpps.reduce((acc, o) => acc + o.valueCents, 0) / 100 };
  }).sort((a,b) => b.valor - a.valor);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const paradas = openOpps.filter(o => new Date(o.stageChangedAt) < fourteenDaysAgo);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-transjordano-green-500">
          <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">Valor Total no Funil</p>
          <h2 className="text-3xl font-bold text-gray-900 tabular">{currencyBRL(total)}</h2>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><TrendingUp size={14}/> Apenas negócios abertos</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">Previsão (Forecast)</p>
          <h2 className="text-3xl font-bold text-gray-900 tabular">{currencyBRL(forecast)}</h2>
          <p className="text-xs text-gray-400 mt-2">Ponderado pela probabilidade</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">Negócios Ganhos</p>
          <h2 className="text-3xl font-bold text-emerald-600 tabular">{currencyBRL(ganhos)}</h2>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">Taxa de Conversão</p>
          <h2 className="text-3xl font-bold text-gray-900 tabular">{percent(conversao)}</h2>
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
                  <XAxis type="number" tickFormatter={(val) => `R$ ${val/1000}k`} stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="name" type="category" width={100} stroke="#4b5563" fontSize={12} />
                  <RechartsTooltip formatter={(val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)} cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="valor" fill="#a3c339" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState title="Sem dados" description="Nenhuma oportunidade aberta no momento." icon={BarChart3} />}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="h-full">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-amber-600"><AlertCircle size={18}/> Oportunidades Paradas</h3>
            <p className="text-xs text-gray-500 mb-4">Negócios na mesma etapa há mais de 14 dias.</p>
            {paradas.length > 0 ? (
              <ul className="space-y-3">
                {paradas.map(o => (
                  <li key={o.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg flex flex-col gap-1">
                    <span className="font-medium text-sm text-gray-800 truncate">{o.title}</span>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{currencyBRL(o.valueCents)}</span>
                      <span className="flex items-center gap-1 text-amber-700 font-medium"><Clock size={12}/> Desde {dateBR(o.stageChangedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
               <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed border-gray-100 rounded-lg">Nenhuma oportunidade parada. Excelente!</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
