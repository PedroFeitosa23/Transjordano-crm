import React from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendingUp } from 'lucide-react';
export function ForecastPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Previsões (AI Forecast)</h2>
        <p className="text-sm text-gray-500">Análise preditiva de atingimento de metas baseada no histórico de fecho.</p>
      </div>
      <Card className="flex-1 flex flex-col items-center justify-center border-dashed border-2 border-purple-200 bg-purple-50/30">
        <EmptyState 
           icon={TrendingUp} 
           title="Motor Preditivo em calibração" 
           description="A inteligência artificial precisará de mais dados históricos para projetar o fecho de trimestre com precisão." 
        />
      </Card>
    </div>
  );
}
