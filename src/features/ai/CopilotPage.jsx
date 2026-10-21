import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BrainCircuit, Send, Sparkles, User, Bot } from 'lucide-react';
import { opportunitiesRepo, leadsRepo } from '@/services/repositories';
import { currencyBRL } from '@/lib/format';
import { toast } from 'sonner';

export function CopilotPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou o Copiloto IA da Transjordano. Como posso ajudar na sua operação comercial hoje? Pode perguntar sobre negócios em risco, previsões ou pedir para redigir e-mails.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const opps = await opportunitiesRepo.list();
      const leads = await leadsRepo.list();
      
      let response = "Analisei a sua base de dados atual na Transjordano. ";
      const lower = userMsg.toLowerCase();

      if (lower.includes('risco') || lower.includes('perigo')) {
        const atRisk = opps.filter(o => o.status === 'open' && o.priority === 'high');
        response += `Encontrei ${atRisk.length} negócios de alta prioridade que requerem atenção imediata. Doutras análises, recomendo focar no contrato "${atRisk[0]?.title || 'Principal'}".`;
      } else if (lower.includes('resumo') || lower.includes('total')) {
        const totalVal = opps.reduce((acc, o) => acc + (o.status === 'open' ? o.valueCents : 0), 0);
        response += `O pipeline aberto possui ${opps.filter(o => o.status === 'open').length} negócios ativos, totalizando ${currencyBRL(totalVal)} em oportunidades logísticas.`;
      } else if (lower.includes('email') || lower.includes('proposta') || lower.includes('escreve')) {
        response += `Aqui tem uma sugestão de follow-up comercial:

"Prezado cliente, esperamos que sua operação logística esteja a todo vapor. Notamos que sua demanda de frete em aberto na Transjordano pode ser otimizada com nossa frota dedicada. Podemos agendar uma breve alinhamento?"`;
      } else {
        response += `Com base nos dados correntes de ${leads.length} leads e ${opps.length} negociações, o fluxo comercial está estável. Recomendo verificar os alertas no Dashboard.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao consultar os dados do CRM.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BrainCircuit className="text-purple-600" size={24} /> Copiloto IA Comercial
        </h2>
        <p className="text-sm text-gray-500">Assistente generativo integrado à base de dados da Transjordano.</p>
      </div>

      <Card className="flex-1 flex flex-col justify-between p-4 bg-white border border-purple-100 shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 custom-scrollbar">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
              )}
              <div className={`p-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#002b5c] text-white rounded-br-none' : 'bg-purple-50/70 text-gray-800 border border-purple-100/60 rounded-bl-none'}`}>
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-transjordano-blue-100 text-transjordano-blue-800 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 items-center text-purple-600 text-sm animate-pulse">
              <Bot size={18} /> A IA está a analisar o CRM...
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-gray-100">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ex: Quais negócios estão em risco? Escreve um e-mail para o cliente..." 
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
          />
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Send size={16} /> Enviar
          </Button>
        </form>
      </Card>
    </div>
  );
}
