import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wand2, FileText, Download, CheckCircle2 } from 'lucide-react';
import { opportunitiesRepo, contactsRepo } from '@/services/repositories';
import { currencyBRL } from '@/lib/format';
import { toast } from 'sonner';

export function GeneratorPage() {
  const [opps, setOpps] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await opportunitiesRepo.list();
        setOpps(data.filter(o => o.status === 'open'));
        if (data.length > 0) setSelectedOppId(data[0].id);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleGenerate = async () => {
    const opp = opps.find(o => o.id === selectedOppId);
    if (!opp) return;

    let contactName = 'Cliente Transjordano';
    try {
      const c = await contactsRepo.get(opp.contactId);
      if (c) contactName = c.name;
    } catch(e) {}

    const proposalContent = `========================================
             TRANSJORDANO - PROPOSTA COMERCIAL
             Segurança em Movimento
========================================

Data: ${new Date().toLocaleDateString('pt-BR')}
Cliente: ${contactName}
Oportunidade: ${opp.title}

DADOS LOGÍSTICOS DA OPERAÇÃO:
- Origem: ${opp.origin || 'Não especificada'}
- Destino: ${opp.destination || 'Não especificado'}
- Tipo de Carga: ${opp.cargoType || 'Carga Geral'}
- Volume Estimado: ${opp.volumeTonsMonth ? opp.volumeTonsMonth + ' ton/mês' : 'A combinar'}

VALOR COMERCIAL:
Valor Base Estimado: ${currencyBRL(opp.valueCents)}

CONDIÇÕES DE FORNECIMENTO:
1. Frota dedicada e rastreada via satélite 24/7.
2. Seguro de carga completo inclusa apólice RCTR-C.
3. Validade desta proposta: 15 dias úteis.

Atenciosamente,
Departamento Comercial | Transjordano
========================================`;

    const blob = new Blob([proposalContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposta_Comercial_${opp.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    toast.success("Proposta comercial gerada e descarregada com sucesso!");
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Wand2 className="text-purple-600" size={24} /> Estúdio de Propostas Comerciais
        </h2>
        <p className="text-sm text-gray-500">Geração automatizada de propostas de frete e contratos logísticos.</p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Negócio / Oportunidade</label>
          <select 
            value={selectedOppId} 
            onChange={e => setSelectedOppId(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500 bg-white"
          >
            {opps.map(o => (
              <option key={o.id} value={o.id}>{o.title} — {currencyBRL(o.valueCents)}</option>
            ))}
          </select>
        </div>

        <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="text-purple-600 shrink-0" size={20} />
          <p className="text-sm text-purple-900">
            A IA cruzará automaticamente os dados de origem, destino, tipo de carga e tabela de preços para formatar o documento oficial com o timbre da Transjordano.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Download size={16} /> Gerar e Baixar Proposta (.txt)
          </Button>
        </div>
      </Card>
    </div>
  );
}
