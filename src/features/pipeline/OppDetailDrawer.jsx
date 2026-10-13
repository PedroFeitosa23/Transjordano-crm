import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Building2, MapPin, Package, Calendar, Phone, Mail, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { currencyBRL, dateBR, dateTimeBR } from '@/lib/format';
import { activitiesRepo, contactsRepo } from '@/services/repositories';
import { toast } from 'sonner';

export function OppDetailDrawer({ opp, stage, open, onOpenChange }) {
  const [activities, setActivities] = useState([]);
  const [contact, setContact] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  useEffect(() => {
    if(!opp) return;
    async function load() {
      const acts = await activitiesRepo.list({ opportunityId: opp.id });
      setActivities(acts.sort((a,b) => new Date(b.doneAt) - new Date(a.doneAt)));
      if (opp.contactId) {
        try { setContact(await contactsRepo.get(opp.contactId)); } catch(e){}
      }
    }
    load();
    setIsAddingNote(false);
    setNoteText('');
  }, [opp]);

  const handleAddNote = async () => {
    if(!noteText.trim()) return;
    try {
      await activitiesRepo.create({ opportunityId: opp.id, type: 'email', summary: noteText, ownerId: opp.ownerId, doneAt: new Date().toISOString() });
      const acts = await activitiesRepo.list({ opportunityId: opp.id });
      setActivities(acts.sort((a,b) => new Date(b.doneAt) - new Date(a.doneAt)));
      setNoteText('');
      setIsAddingNote(false);
      toast.success("Nota registada com sucesso!");
    } catch(e) { toast.error("Erro ao adicionar nota."); }
  };

  const handleGenerateProposal = () => {
    const content = `PROPOSTA COMERCIAL\n\nCliente: ${contact?.name || 'Não definido'}\nProjeto: ${opp.title}\nOrigem: ${opp.origin || 'A definir'}\nDestino: ${opp.destination || 'A definir'}\nCarga: ${opp.cargoType || 'Geral'}\nVolume Previsto: ${opp.volumeTonsMonth || 'TBD'} ton/mês\n\nValor Base Estimado: R$ ${(opp.valueCents/100).toFixed(2)}\n\nTransjordano - Segurança em Movimento`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Proposta_${opp.id}.txt`; a.click();
    toast.success("Proposta comercial exportada!");
  };

  if (!opp) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 w-full max-w-lg bg-gray-50 shadow-2xl z-50 flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right overflow-hidden">
          
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-start shrink-0">
            <div>
              <div className="flex gap-2 mb-2"><Badge variant="info">{stage?.name}</Badge><Badge variant="brand">{opp.priority === 'high' ? 'Alta Prioridade' : 'Normal'}</Badge></div>
              <Dialog.Title className="text-xl font-bold text-gray-900 leading-tight pr-8">{opp.title}</Dialog.Title>
              <p className="text-2xl font-bold text-transjordano-green-600 mt-2">{currencyBRL(opp.valueCents)}</p>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {contact && (
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cliente</h4>
                 <div className="flex items-center gap-3 mb-2"><Building2 className="text-transjordano-blue-500" size={18}/><span className="font-semibold text-gray-800">{contact.name}</span></div>
                 <div className="flex items-center gap-3 text-sm text-gray-600 mb-1"><Phone size={14}/> {contact.phone}</div>
                 <div className="flex items-center gap-3 text-sm text-gray-600"><Mail size={14}/> {contact.email}</div>
               </div>
             )}

             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detalhes Logísticos (Carga)</h4>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Origem</p>
                      <p className="font-medium text-gray-800 flex items-center gap-1"><MapPin size={14} className="text-gray-400"/> {opp.origin || 'Não definido'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Destino</p>
                      <p className="font-medium text-gray-800 flex items-center gap-1"><MapPin size={14} className="text-gray-400"/> {opp.destination || 'Não definido'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Tipo de Carga</p>
                      <p className="font-medium text-gray-800 flex items-center gap-1"><Package size={14} className="text-gray-400"/> {opp.cargoType || 'Geral'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Volume Previsto</p>
                      <p className="font-medium text-gray-800">{opp.volumeTonsMonth ? `${opp.volumeTonsMonth} ton/mês` : 'TBD'}</p>
                    </div>
                 </div>
             </div>

             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                 {isAddingNote ? (
                    <div className="mb-4">
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nova Nota / Atividade</h4>
                       <textarea autoFocus value={noteText} onChange={e=>setNoteText(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:border-transjordano-green-500" rows="3" placeholder="Descreva o que aconteceu (reunião, email, negociação)..."></textarea>
                       <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={()=>setIsAddingNote(false)}>Cancelar</Button>
                          <Button size="sm" onClick={handleAddNote}>Salvar Nota</Button>
                       </div>
                    </div>
                 ) : (
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Histórico & Atividades</h4>
                       <Button size="sm" onClick={()=>setIsAddingNote(true)} variant="ghost" className="h-6 px-2 text-xs text-transjordano-blue-600 bg-blue-50 hover:bg-blue-100"><Plus size={12} className="mr-1"/> Add Nota</Button>
                    </div>
                 )}

                 {activities.length > 0 ? (
                   <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                     {activities.map(act => (
                       <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-transjordano-blue-100 text-transjordano-blue-600 shrink-0 z-10 font-bold text-[10px]">
                            {act.type === 'call' ? '📞' : act.type === 'meeting' ? '🤝' : '✉️'}
                          </div>
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-gray-100 bg-gray-50 shadow-sm ml-4 md:ml-0 md:mr-4">
                             <div className="text-xs text-gray-400 mb-1">{dateTimeBR(act.doneAt)}</div>
                             <div className="text-sm font-medium text-gray-800 whitespace-pre-wrap">{act.summary}</div>
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (!isAddingNote && <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-100 rounded-lg">Nenhuma atividade registada.</p>)}
             </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex gap-2">
            <Button className="flex-1" onClick={handleGenerateProposal}>Gerar Proposta</Button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
