import React, { useEffect, useState } from 'react';
import { opportunitiesRepo, stagesRepo } from '@/services/repositories';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/features/auth/can';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { currencyBRL, compactBRL } from '@/lib/format';
import { GripVertical, AlertCircle } from 'lucide-react';

function SortableItem({ opp }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opp.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  
  const atrasada = opp.expectedCloseDate && new Date(opp.expectedCloseDate) < new Date() && opp.status === 'open';

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing mb-2 hover:border-transjordano-green-500 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight pr-4">{opp.title}</h4>
        <div {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 -mr-1"><GripVertical size={16}/></div>
      </div>
      <div className="flex justify-between items-end mt-3">
        <span className="text-sm font-semibold text-gray-900">{compactBRL(opp.valueCents)}</span>
        {atrasada && <span className="text-[10px] flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium"><AlertCircle size={10}/> Atrasada</span>}
      </div>
    </div>
  );
}

export function PipelinePage() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    async function load() {
      try {
        const filters = can(user, 'view:all_opportunities') ? {} : { ownerId: user.uid };
        const oppsData = await opportunitiesRepo.list(filters);
        const stagesData = (await stagesRepo.list()).filter(s => s.kind === 'open').sort((a,b) => a.order - b.order);
        setStages(stagesData);
        setOpportunities(oppsData.sort((a,b) => a.position - b.position));
      } finally { setLoading(false); }
    }
    load();
  }, [user]);

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeOpp = opportunities.find(o => o.id === activeId);
    if (!activeOpp) return;

    const isOverStage = stages.some(s => s.id === overId);
    const targetStageId = isOverStage ? overId : opportunities.find(o => o.id === overId)?.stageId;
    
    if (activeOpp.stageId !== targetStageId) {
      setOpportunities(prev => prev.map(o => o.id === activeId ? { ...o, stageId: targetStageId, stageChangedAt: new Date().toISOString() } : o));
      await opportunitiesRepo.update(activeId, { stageId: targetStageId, stageChangedAt: new Date().toISOString() });
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-pulse flex gap-4">{[1,2,3,4].map(i => <div key={i} className="w-72 h-96 bg-gray-200 rounded-xl"></div>)}</div></div>;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Pipeline de Vendas</h2>
      </div>

      <div className="flex-1 overflow-x-auto flex gap-4 pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {stages.map(stage => {
            const stageOpps = opportunities.filter(o => o.stageId === stage.id);
            const totalCents = stageOpps.reduce((acc, o) => acc + o.valueCents, 0);
            
            return (
              <div key={stage.id} className="flex-shrink-0 w-80 bg-gray-100/50 rounded-xl border border-gray-200 flex flex-col h-full max-h-full">
                <div className="p-3 border-b border-gray-200 bg-gray-50/80 rounded-t-xl">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{stage.name}</h3>
                    <span className="bg-white text-gray-500 text-xs px-2 py-0.5 rounded-full border border-gray-200 font-medium">{stageOpps.length}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium tabular">{currencyBRL(totalCents)}</div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  <SortableContext items={stageOpps.map(o => o.id)} strategy={verticalListSortingStrategy}>
                    {stageOpps.map(opp => <SortableItem key={opp.id} opp={opp} />)}
                  </SortableContext>
                </div>
              </div>
            );
          })}
          <DragOverlay>{activeId ? <div className="bg-white p-4 rounded-lg shadow-xl border border-transjordano-green-500 opacity-90"><h4 className="font-medium text-sm text-gray-800">Movendo oportunidade...</h4></div> : null}</DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
