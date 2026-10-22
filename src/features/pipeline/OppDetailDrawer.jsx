import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, DollarSign, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { opportunitiesRepo } from '@/services/repositories';
import { toast } from 'sonner';

export function OppDetailDrawer({ opp, stage, open, onOpenChange, onUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    valueCents: 0,
    negotiationType: '',
    prospectingDate: '',
    endDate: '',
    notes: '',
    stageId: '',
  });

  useEffect(() => {
    if (opp) {
      setFormData({
        title: opp.title || '',
        valueCents: opp.valueCents ? opp.valueCents / 100 : 0,
        negotiationType: opp.negotiationType || '',
        prospectingDate: opp.prospectingDate || '',
        endDate: opp.endDate || '',
        notes: opp.notes || '',
        stageId: opp.stageId || 's2',
      });
    }
  }, [opp]);

  if (!opp) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        title: formData.title,
        valueCents: Math.round(parseFloat(formData.valueCents || 0) * 100),
        negotiationType: formData.negotiationType,
        prospectingDate: formData.prospectingDate,
        endDate: formData.endDate,
        notes: formData.notes,
      };

      await opportunitiesRepo.update(opp.id, updatedData);
      toast.success('Oportunidade atualizada com sucesso!');
      onOpenChange(false);
      
      if (onUpdate) {
        onUpdate({ ...opp, ...updatedData });
      } else {
        window.location.href = '/funil';
      }
    } catch (err) { toast.error('Erro ao atualizar.'); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir a oportunidade "${opp.title}"?`)) return;
    try {
      await opportunitiesRepo.delete(opp.id);
      toast.success('Oportunidade excluída!');
      onOpenChange(false);
      window.location.href = '/funil';
    } catch (err) { toast.error('Erro ao excluir.'); }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
          
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <div>
              <span className="text-xs uppercase font-semibold text-transjordano-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">{stage?.name || 'Etapa'}</span>
              <Dialog.Title className="text-xl font-bold text-gray-900 mt-1">{opp.title}</Dialog.Title>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Negociação (Cliente)</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Estimado (R$)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" step="0.01" value={formData.valueCents} onChange={e => setFormData({...formData, valueCents: e.target.value})} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Prospecção</label>
                <input type="date" value={formData.prospectingDate} onChange={e => setFormData({...formData, prospectingDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Negociação</label>
              <select value={formData.negotiationType} onChange={e => setFormData({...formData, negotiationType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Selecione o tipo de carga...</option>
                <option value="Combustível">Combustível</option>
                <option value="Seco">Seco</option>
                <option value="Gás">Gás</option>
                <option value="Varejo">Varejo</option>
                <option value="Indústria">Indústria</option>
                <option value="Florestal">Florestal</option>
                <option value="Granéis Sólidos">Granéis Sólidos</option>
                <option value="Granéis Líquidos">Granéis Líquidos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas e Observações</label>
              <textarea rows="4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"></textarea>
            </div>

            <div className="pt-6 border-t flex items-center justify-between mt-8">
              <Button type="button" variant="danger" onClick={handleDelete} className="gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                <Trash2 size={16} /> Excluir Oportunidade
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" className="gap-2"><CheckCircle2 size={16} /> Salvar Alterações</Button>
              </div>
            </div>
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
