import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Briefcase } from 'lucide-react';

export function PipelinePage() {
  return (
    <div className="h-full bg-white rounded-xl border border-gray-200">
      <EmptyState title="Funil de Vendas" description="O quadro Kanban será implementado na Fase 4." icon={Briefcase} />
    </div>
  );
}