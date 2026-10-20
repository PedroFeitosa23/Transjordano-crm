import React from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Wand2 } from 'lucide-react';
export function GeneratorPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Estúdio de Propostas</h2>
        <p className="text-sm text-gray-500">Geração automática de propostas comerciais PDF e e-mails de follow-up.</p>
      </div>
      <Card className="flex-1 flex flex-col items-center justify-center border-dashed border-2 border-purple-200 bg-purple-50/30">
        <EmptyState 
           icon={Wand2} 
           title="Estúdio Generativo" 
           description="Neste ecrã poderá redigir propostas logísticas complexas com apenas 1 clique, cruzando dados de rotas e tabelas de frete." 
        />
      </Card>
    </div>
  );
}
