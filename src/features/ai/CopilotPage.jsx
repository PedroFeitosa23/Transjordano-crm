import React from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { BrainCircuit } from 'lucide-react';
export function CopilotPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Copiloto IA</h2>
        <p className="text-sm text-gray-500">Seu assistente comercial para análise de dados e geração de insights.</p>
      </div>
      <Card className="flex-1 flex flex-col items-center justify-center border-dashed border-2 border-purple-200 bg-purple-50/30">
        <EmptyState 
           icon={BrainCircuit} 
           title="Assistente IA em construção" 
           description="Este módulo conectará a base de dados a um modelo LLM (como Gemini ou OpenAI) para interações em linguagem natural." 
        />
      </Card>
    </div>
  );
}
