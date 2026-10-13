import React from 'react';
import { Card } from '@/components/ui/Card';
import { currencyBRL, percent } from '@/lib/format';

export function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card>
          <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Valor Total no Funil</p>
          <h2 className="text-3xl font-bold text-gray-900 tabular">{currencyBRL(0)}</h2>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Previsão (Forecast)</p>
          <h2 className="text-3xl font-bold text-gray-900 tabular">{currencyBRL(0)}</h2>
          <p className="text-xs text-gray-500 mt-2">Ponderado pela probabilidade</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Negócios Ganhos</p>
          <h2 className="text-3xl font-bold text-gray-900 tabular">{currencyBRL(0)}</h2>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Taxa de Conversão</p>
          <h2 className="text-3xl font-bold text-gray-900 tabular">{percent(0)}</h2>
        </Card>
      </div>
      
      <Card className="flex items-center justify-center h-64 border-dashed bg-gray-50/50">
        <p className="text-gray-500">Área de gráficos e pipeline detalhado será renderizada aqui (Fase 3).</p>
      </Card>
    </div>
  );
}