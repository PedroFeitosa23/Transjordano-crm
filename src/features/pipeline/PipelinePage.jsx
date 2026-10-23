import { GripVertical, CheckCircle, XCircle, Flame, EyeOff, Eye, FileSpreadsheet, Download, Upload, Clock, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { opportunitiesRepo, stagesRepo } from '@/services/repositories';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/features/auth/can';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { currencyBRL, compactBRL } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { OppDetailDrawer } from './OppDetailDrawer';

function getSlaConfig(dateString) {
  if (!dateString) {
    return { text: 'Recente', colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', Icon: Clock };
  }
  
  const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
  
  if (days <= 3) {
    return { text: days === 0 ? 'Hoje' : `${days}d na etapa`, colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', Icon: Clock };
  }
  if (days <= 7) {
    return { text: `${days}d na etapa`, colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', Icon: Clock };
  }
  return { text: `${days}d na etapa`, colorClass: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', Icon: AlertCircle };
}

function DroppableColumn({ stage, opps, onHideAll, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { type: 'stage', stage } });
  const isGanhoOuPerdido = stage.name.toLowerCase().includes('ganho') || stage.name.toLowerCase().includes('perdid');
  
  return (
    <div ref={setNodeRef} className={`flex-shrink-0 w-80 rounded-xl border flex flex-col h-full max-h-full transition-colors duration-200 ${isOver ? 'bg-transjordano-green-50/50 dark:bg-brand-green/10 border-brand-green' : 'bg-gray-100/50 dark:bg-slate-800/40 border-border'}`}>
      <div className="p-3 border-b border-border bg-gray-50/80 dark:bg-slate-800/80 rounded-t-xl">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-primary text-sm">{stage.name}</h3>
            {isGanhoOuPerdido && (
              <button onClick={() => onHideAll(stage.id)} className="text-muted hover:text-primary transition-colors bg-surface border border-border rounded px-1 shadow-sm" title="Ocultar Todos">
                <EyeOff size={14} />
              </button>
            )}
          </div>
          <span className="bg-surface text-secondary text-xs px-2 py-0.5 rounded-full border border-border font-medium">{opps.length}</span>
        </div>
        <div className="text-xs text-secondary font-medium tabular">{currencyBRL(opps.reduce((a,o)=>a+o.valueCents,0))}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <SortableContext items={opps.map(o => o.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableItem({ opp, stage, onClick, onToggleHide }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opp.id, data: { type: 'opp', opp } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : (opp.hidden ? 0.5 : 1) };
  const isHighPriority = opp.priority === 'high';
  
  const hiddenClasses = opp.hidden ? 'bg-app border-border grayscale-[0.5]' : 'bg-surface border-border hover:border-brand-green dark:hover:border-brand-green';
  const sla = getSlaConfig(opp.stageChangedAt || opp.createdAt);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(opp)} className={`p-3 rounded-lg shadow-sm border cursor-grab active:cursor-grabbing mb-3 transition-all duration-200 group relative flex flex-col gap-3 ${hiddenClasses}`}>
      <div className="flex justify-between items-start pl-1">
        <div className="flex-1 pr-2">
          <h4 className={`font-semibold text-sm line-clamp-2 leading-tight ${opp.hidden ? 'text-muted line-through' : 'text-primary'}`}>{opp.title}</h4>
          <p className="text-[11px] font-medium text-secondary mt-1 truncate uppercase tracking-wider">{opp.negotiationType || 'Geral'}</p>
        </div>
        <div className="flex gap-1.5 items-start">
          {isHighPriority && <Flame size={16} className="text-orange-500 shrink-0" />}
          <button onClick={(e) => onToggleHide(opp, e)} className={`transition-colors z-10 ${opp.hidden ? 'text-transjordano-blue-500 dark:text-blue-400 hover:text-transjordano-blue-700 dark:hover:text-blue-300 opacity-100' : 'text-muted hover:text-primary opacity-0 group-hover:opacity-100'}`} title={opp.hidden ? "Desocultar" : "Ocultar do Painel"}>
            {opp.hidden ? <Eye size={16} /> : <EyeOff size={14} />}
          </button>
        </div>
      </div>
      <div className="flex justify-between items-end pl-1 pt-1 border-t border-border/50">
        <span className={`text-sm font-bold tabular tracking-tight ${opp.hidden ? 'text-muted' : 'text-primary'}`}>{compactBRL(opp.valueCents)}</span>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${sla.colorClass} ${opp.hidden ? 'opacity-50 grayscale' : ''}`}>
          <sla.Icon size={10} strokeWidth={2.5} />
          <span className="text-[10px] font-bold tracking-wide">{sla.text}</span>
        </div>
      </div>
    </div>
  );
}

function ResolutionZone({ id, label, icon: Icon, colorClass }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: 'resolution' } });
  return (
    <div ref={setNodeRef} className={`flex-1 p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${isOver ? colorClass + ' scale-[1.02]' : 'bg-surface dark:bg-slate-800 border-border text-secondary'}`}><Icon size={20} /><span className="font-medium">{label}</span></div>
  );
}

export function PipelinePage() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOpp, setActiveOpp] = useState(null);
  const [activeTab, setActiveTab] = useState('pipeline');
  
  const [drawerOpp, setDrawerOpp] = useState(null);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [pendingLostOppId, setPendingLostOppId] = useState(null);
  const [lostReason, setLostReason] = useState('');

  const [hideAllModalOpen, setHideAllModalOpen] = useState(false);
  const [pendingHideStageId, setPendingHideStageId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    async function load() {
      try {
        const filters = can(user, 'view:all_opportunities') ? {} : { ownerId: user.uid };
        const oppsData = await opportunitiesRepo.list(filters);
        
        let stagesData = await stagesRepo.list();
        stagesData = stagesData.filter(s => 
          s.id !== 'agenda' && 
          s.name.toLowerCase() !== 'agenda' &&
          s.id !== 's1' &&
          !s.name.toLowerCase().includes('prospec')
        );
        
        setStages(stagesData.sort((a,b) => a.order - b.order));
        setOpportunities(oppsData.sort((a,b) => a.position - b.position));
      } finally { setLoading(false); }
    }
    load();
  }, [user]);

  const handleToggleHide = async (opp, e) => {
    e.stopPropagation(); 
    const newState = !opp.hidden;
    try {
      await opportunitiesRepo.update(opp.id, { hidden: newState });
      setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, hidden: newState } : o));
    } catch(err) { toast.error('Erro ao alterar visualização.'); }
  };

  const handleHideAllInStage = (stageId) => {
    const oppsToHide = opportunities.filter(o => o.stageId === stageId && !o.hidden);
    if(oppsToHide.length === 0) return;
    setPendingHideStageId(stageId);
    setHideAllModalOpen(true);
  };

  const confirmHideAll = async () => {
    if (!pendingHideStageId) return;
    const stageId = pendingHideStageId;
    const oppsToHide = opportunities.filter(o => o.stageId === stageId && !o.hidden);
    setHideAllModalOpen(false);
    setPendingHideStageId(null);

    try {
      await Promise.all(oppsToHide.map(o => opportunitiesRepo.update(o.id, { hidden: true })));
      setOpportunities(prev => prev.map(o => o.stageId === stageId ? { ...o, hidden: true } : o));
      toast.success('Cartões ocultados!');
    } catch(e) { toast.error('Erro ao ocultar cartões.'); }
  };

  const handleDragStart = (event) => setActiveOpp(opportunities.find(o => o.id === event.active.id));
  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveOpp(null);
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    if (overId === 'zone-won') {
       const wonStage = stages.find(s => s.kind === 'won');
       if(!wonStage) return toast.error("Etapa 'Ganho' não encontrada");
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
      try { 
        const novoStatus = targetStageId === 's5' ? 'won' : (targetStageId === 's6' ? 'lost' : 'open');
        await opportunitiesRepo.update(activeId, { stageId: targetStageId, status: novoStatus, stageChangedAt: new Date().toISOString() }, user.uid); 
      } catch (err) { setOpportunities(originalOpps); toast.error("Erro ao mover."); }
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
      await opportunitiesRepo.update(pendingLostOppId, { status: 'lost', stageId: lostStage?.id || 's6', lostReason, closedAt: new Date().toISOString(), stageChangedAt: new Date().toISOString() }, user.uid);
      setLostReason('');
    } catch (err) { setOpportunities(originalOpps); toast.error("Erro."); }
  };

  const handleExportPipelineCSV = () => {
    if (opportunities.length === 0) {
      toast.error('Não há oportunidades no funil para exportar.');
      return;
    }
    const headers = ['Titulo', 'Valor(Reais)', 'TipoNegociacao', 'DataProspeccao', 'DataTermino', 'Status', 'Observacoes'];
    const rows = opportunities.map(o => [
      `"${o.title || ''}"`,
      (o.valueCents ? o.valueCents / 100 : 0),
      `"${o.negotiationType || ''}"`,
      `"${o.prospectingDate || ''}"`,
      `"${o.endDate || ''}"`,
      `"${o.status || 'open'}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "funil_vendas_transjordano.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Funil exportado com sucesso!');
  };

  const handleImportPipelineCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        if (lines.length < 2) {
          toast.error('Arquivo CSV vazio ou inválido.');
          return;
        }
        let count = 0;
        const firstStageId = stages[0]?.id || 's2';
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (cols.length >= 1) {
            const clean = (val) => val ? val.trim().replace(/^"(.*)"$/, '').replace(/""/g, '"') : '';
            const valReais = parseFloat(cols[1]) || 0;
            const oppData = {
              title: clean(cols[0]) || 'Negociação Importada',
              valueCents: Math.round(valReais * 100),
              negotiationType: clean(cols[2]),
              prospectingDate: clean(cols[3]) || new Date().toISOString().split('T')[0],
              endDate: clean(cols[4]),
              status: clean(cols[5]) || 'open',
              notes: clean(cols[6]),
              stageId: firstStageId,
              priority: 'medium',
              ownerId: user.uid || 'admin123'
            };
            const created = await opportunitiesRepo.create(oppData);
            setOpportunities(prev => [...prev, created]);
            count++;
          }
        }
        toast.success(`${count} oportunidades importadas para o funil!`);
        setActiveTab('pipeline');
      } catch (err) {
        toast.error('Erro ao processar o arquivo CSV do funil.');
      }
    };
    reader.readAsText(file);
  };

  if (loading) return <div className="animate-pulse flex gap-4 h-full p-4">{[1,2,3].map(i => <div key={i} className="w-80 h-96 bg-surface border border-border rounded-xl"></div>)}</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">Pipeline de Vendas</h2>
        <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1 border border-border">
          <button onClick={() => setActiveTab('pipeline')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'pipeline' ? 'bg-surface shadow text-primary' : 'text-secondary hover:text-primary'}`}>Quadro do Funil</button>
          <button onClick={() => setActiveTab('export')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${activeTab === 'export' ? 'bg-surface shadow text-primary' : 'text-secondary hover:text-primary'}`}>
            <FileSpreadsheet size={14} /> Exportação / Excel
          </button>
        </div>
      </div>

      {activeTab === 'export' ? (
        <Card className="p-8 max-w-xl mx-auto space-y-6 text-center mt-6 bg-surface border-border">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">Exportar ou Importar Funil de Vendas</h3>
            <p className="text-sm text-secondary mt-1">Baixe um relatório em Excel (CSV) das negociações atuais ou importe novos dados diretamente.</p>
          </div>
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <Button onClick={handleExportPipelineCSV} className="gap-2 justify-center bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download size={16} /> Exportar Funil para Excel (.CSV)
            </Button>
            <div className="relative">
              <input type="file" accept=".csv" onChange={handleImportPipelineCSV} className="absolute inset-0 opacity-0 cursor-pointer w-full" id="import-pipeline" />
              <label htmlFor="import-pipeline" className="flex items-center justify-center gap-2 w-full border border-border hover:bg-gray-50 dark:hover:bg-slate-700/50 text-primary font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors text-sm">
                <Upload size={16} /> Importar Oportunidades para o Funil (.CSV)
              </label>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 pb-2 min-h-0">
              {stages.map(stage => {
                const stageOpps = opportunities.filter(o => o.stageId === stage.id);
                return (
                  <DroppableColumn key={stage.id} stage={stage} opps={stageOpps} onHideAll={handleHideAllInStage}>
                    {stageOpps.map(opp => <SortableItem key={opp.id} opp={opp} stage={stage} onClick={setDrawerOpp} onToggleHide={handleToggleHide} />)}
                  </DroppableColumn>
                );
              })}
            </div>
            {activeOpp && (
              <div className="h-24 mt-4 flex gap-4 animate-in slide-in-from-bottom-4 fade-in">
                <ResolutionZone id="zone-won" label="Solte aqui para GANHO" icon={CheckCircle} colorClass="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400" />
                <ResolutionZone id="zone-lost" label="Solte aqui para PERDIDO" icon={XCircle} colorClass="bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400" />
              </div>
            )}
            <DragOverlay>{activeOpp ? <div className="bg-surface p-3 rounded-lg shadow-xl border-2 border-transjordano-blue-500 opacity-95 rotate-2 w-80"><h4 className="font-medium text-sm text-primary">{activeOpp.title}</h4></div> : null}</DragOverlay>
          </DndContext>
        </>
      )}

      <Dialog.Root open={lostModalOpen} onOpenChange={setLostModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-surface border border-transparent dark:border-slate-700 rounded-xl p-6 shadow-pop w-[90vw] max-w-md z-50 focus:outline-none">
            <Dialog.Title className="text-lg font-semibold mb-4 text-primary">Motivo da Perda</Dialog.Title>
            <form onSubmit={handleConfirmLost}>
              <select required value={lostReason} onChange={e => setLostReason(e.target.value)} className="w-full bg-surface text-primary border-border rounded-lg px-3 py-2 border mb-6 focus:outline-none focus:border-brand-green">
                <option value="">Selecione um motivo...</option><option value="Preço">Preço</option><option value="Concorrente">Concorrente</option><option value="Prazo">Prazo</option>
              </select>
              <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setLostModalOpen(false)}>Cancelar</Button><Button type="submit" variant="danger">Confirmar Perda</Button></div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={hideAllModalOpen} onOpenChange={setHideAllModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-surface border border-transparent dark:border-slate-700 rounded-xl p-6 shadow-pop w-[90vw] max-w-sm z-50 focus:outline-none text-center">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeOff size={24} />
            </div>
            <Dialog.Title className="text-lg font-bold mb-2 text-primary">Ocultar Cartões</Dialog.Title>
            <p className="text-sm text-secondary mb-6">Tem certeza que deseja ocultar todos os cartões visíveis desta coluna? Poderá desocultá-los individualmente depois.</p>
            <div className="flex justify-center gap-3">
              <Button type="button" variant="ghost" onClick={() => setHideAllModalOpen(false)}>Cancelar</Button>
              <Button type="button" onClick={confirmHideAll} className="bg-amber-600 hover:bg-amber-700 text-white border-transparent shadow-sm px-4 py-2 rounded-lg font-medium">Ocultar Tudo</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <OppDetailDrawer opp={drawerOpp} stage={stages.find(s => s.id === drawerOpp?.stageId)} open={!!drawerOpp} onOpenChange={(o) => !o && setDrawerOpp(null)} onUpdate={(updatedOpp) => {
         setOpportunities(prev => prev.map(o => o.id === updatedOpp.id ? updatedOpp : o));
      }}/>
    </div>
  );
}
