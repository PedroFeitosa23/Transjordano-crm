import { GripVertical, CheckCircle, XCircle, CalendarClock, Flame, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { opportunitiesRepo, stagesRepo } from '@/services/repositories';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/features/auth/can';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { currencyBRL, compactBRL, getSlaStatus, dateBR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { OppDetailDrawer } from './OppDetailDrawer';

function DroppableColumn({ stage, opps, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { type: 'stage', stage } });
  return (
    <div ref={setNodeRef} className={`flex-shrink-0 w-80 rounded-xl border flex flex-col h-full max-h-full transition-colors ${isOver ? 'bg-transjordano-green-50 border-transjordano-green-300' : 'bg-gray-100/50 border-gray-200'}`}>
      <div className="p-3 border-b border-gray-200 bg-gray-50/80 rounded-t-xl">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 text-sm">{stage.name}</h3>
            {stage.slaDays > 0 && <span className="text-[10px] text-gray-400 font-medium" title="SLA da Etapa">SLA: {stage.slaDays}d</span>}
          </div>
          <span className="bg-white text-gray-500 text-xs px-2 py-0.5 rounded-full border font-medium">{opps.length}</span>
        </div>
        <div className="text-xs text-gray-500 font-medium tabular">{currencyBRL(opps.reduce((a,o)=>a+o.valueCents,0))}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <SortableContext items={opps.map(o => o.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}

// Fase 2: Enriched Card
function SortableItem({ opp, stage, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opp.id, data: { type: 'opp', opp } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  
  const slaStatus = getSlaStatus(opp.stageChangedAt, stage?.slaDays);
  const isHighPriority = opp.priority === 'high';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(opp)} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing mb-2 hover:border-transjordano-green-500 transition-colors group relative">
      {/* SLA Indicator Side Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${slaStatus === 'good' ? 'bg-transjordano-green' : slaStatus === 'warning' ? 'bg-amber-400' : 'bg-red-500'}`}></div>
      
      <div className="flex justify-between items-start mb-2 pl-2">
        <div>
          <h4 className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight">{opp.title}</h4>
          <p className="text-xs text-gray-500 mt-1 truncate">{opp.origin ? `${opp.origin} -> ${opp.destination}` : 'Logística'}</p>
        </div>
        {isHighPriority && <Flame size={14} className="text-orange-500 shrink-0 mt-0.5" />}
      </div>
      
      <div className="flex justify-between items-end mt-3 pl-2">
        <span className="text-sm font-semibold text-gray-900 tabular">{compactBRL(opp.valueCents)}</span>
        
        {/* Next Action Marker */}
        {opp.nextActivityAt ? (
           <span className="text-[10px] flex items-center gap-1 text-transjordano-blue-500 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-100"><CalendarClock size={10}/> {dateBR(opp.nextActivityAt)}</span>
        ) : (
           <span className="text-[10px] flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium border border-red-100">Sem Ação</span>
        )}
      </div>
    </div>
  );
}

function ResolutionZone({ id, label, icon: Icon, colorClass }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: 'resolution' } });
  return (
    <div ref={setNodeRef} className={`flex-1 p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${isOver ? colorClass + ' scale-[1.02]' : 'bg-gray-50 border-gray-300 text-gray-500'}`}>
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function PipelinePage() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOpp, setActiveOpp] = useState(null);
  
  const [drawerOpp, setDrawerOpp] = useState(null);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [pendingLostOppId, setPendingLostOppId] = useState(null);
  const [lostReason, setLostReason] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    async function load() {
      try {
        const filters = can(user, 'view:all_opportunities') ? {} : { ownerId: user.uid };
        const oppsData = await opportunitiesRepo.list(filters);
        const stagesData = await stagesRepo.list();
        setStages(stagesData.sort((a,b) => a.order - b.order));
        setOpportunities(oppsData.sort((a,b) => a.position - b.position));
      } finally { setLoading(false); }
    }
    load();
  }, [user]);

  const handleDragStart = (event) => setActiveOpp(opportunities.find(o => o.id === event.active.id));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveOpp(null);
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    if (overId === 'zone-won') {
       const wonStage = stages.find(s => s.kind === 'won');
       const originalOpps = [...opportunities];
       setOpportunities(prev => prev.filter(o => o.id !== activeId)); 
       toast.success("Negócio Ganho! Parabéns!");
       try { await opportunitiesRepo.update(activeId, { status: 'won', stageId: wonStage.id, closedAt: new Date().toISOString(), stageChangedAt: new Date().toISOString() }, user.uid); } 
       catch (err) { setOpportunities(originalOpps); toast.error("Erro."); }
       return;
    }
    
    if (overId === 'zone-lost') {
       setPendingLostOppId(activeId); setLostModalOpen(true); return;
    }

    const targetStageId = over.data.current?.type === 'stage' ? overId : opportunities.find(o => o.id === overId)?.stageId;
    if (targetStageId && opportunities.find(o => o.id === activeId)?.stageId !== targetStageId) {
      const originalOpps = [...opportunities];
      setOpportunities(prev => prev.map(o => o.id === activeId ? { ...o, stageId: targetStageId, stageChangedAt: new Date().toISOString() } : o));
      try { const novoStatus = targetStageId === 's5' ? 'won' : (targetStageId === 's6' ? 'lost' : 'open');
      await opportunitiesRepo.update(activeId, { stageId: targetStageId, status: novoStatus, stageChangedAt: new Date().toISOString() }, user.uid); } 
      catch (err) { setOpportunities(originalOpps); toast.error("Erro ao mover."); }
    }
  };

  const handleConfirmLost = async (e) => {
    e.preventDefault();
    if(!lostReason) return;
    const lostStage = stages.find(s => s.kind === 'lost');
    const originalOpps = [...opportunities];
    setOpportunities(prev => prev.filter(o => o.id !== pendingLostOppId));
    setLostModalOpen(false); toast.info("Negócio perdido.");
    try {
      await opportunitiesRepo.update(pendingLostOppId, { status: 'lost', stageId: lostStage.id, lostReason, closedAt: new Date().toISOString(), stageChangedAt: new Date().toISOString() }, user.uid);
      setLostReason('');
    } catch (err) { setOpportunities(originalOpps); toast.error("Erro."); }
  };

  if (loading) return <div className="animate-pulse flex gap-4 h-full p-4">{[1,2,3].map(i => <div key={i} className="w-80 h-96 bg-gray-200 rounded-xl"></div>)}</div>;
  const openStages = stages;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Pipeline de Vendas</h2>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 pb-2 min-h-0">
          {openStages.map(stage => {
            const stageOpps = opportunities.filter(o => o.stageId === stage.id);
            return (
              <DroppableColumn key={stage.id} stage={stage} opps={stageOpps}>
                {stageOpps.map(opp => <SortableItem key={opp.id} opp={opp} stage={stage} onClick={setDrawerOpp} />)}
              </DroppableColumn>
            );
          })}
        </div>
        
        {activeOpp && (
          <div className="h-24 mt-4 flex gap-4 animate-in slide-in-from-bottom-4 fade-in">
            <ResolutionZone id="zone-won" label="Solte aqui para GANHO" icon={CheckCircle} colorClass="bg-emerald-50 border-emerald-500 text-emerald-700" />
            <ResolutionZone id="zone-lost" label="Solte aqui para PERDIDO" icon={XCircle} colorClass="bg-red-50 border-red-500 text-red-700" />
          </div>
        )}
        <DragOverlay>{activeOpp ? <div className="bg-white p-3 rounded-lg shadow-xl border-2 border-transjordano-blue-500 opacity-95 rotate-2 w-80"><h4 className="font-medium text-sm text-gray-800">{activeOpp.title}</h4></div> : null}</DragOverlay>
      </DndContext>

      {/* Modal Lost */}
      <Dialog.Root open={lostModalOpen} onOpenChange={setLostModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl p-6 shadow-pop w-[90vw] max-w-md z-50 focus:outline-none">
            <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900">Motivo da Perda</Dialog.Title>
            <form onSubmit={handleConfirmLost}>
              <select required value={lostReason} onChange={e => setLostReason(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2 border mb-6">
                <option value="">Selecione um motivo...</option><option value="Preço">Preço</option><option value="Concorrente">Concorrente</option><option value="Prazo">Prazo</option>
              </select>
              <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setLostModalOpen(false)}>Cancelar</Button><Button type="submit" variant="danger">Confirmar Perda</Button></div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <OppDetailDrawer opp={drawerOpp} stage={stages.find(s => s.id === drawerOpp?.stageId)} open={!!drawerOpp} onOpenChange={(o) => !o && setDrawerOpp(null)} />
    </div>
  );
}
