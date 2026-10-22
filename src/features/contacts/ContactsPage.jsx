import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { leadsRepo, opportunitiesRepo } from '@/services/repositories';
import { Users, Phone, Mail, Building2, ArrowRightLeft, Plus, X, DollarSign, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';

export function ContactsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await leadsRepo.list();
        setLeads(data);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const handleMoveToFunnel = async (lead) => {
    try {
      const valueReais = parseFloat(lead.value) || 0;
      const valueCents = Math.round(valueReais * 100);
      const oppTitle = lead.contactName ? `${lead.contactName} (${lead.name})` : lead.name;

      await opportunitiesRepo.create({
        title: oppTitle,
        contactId: lead.id,
        valueCents: valueCents,
        stageId: 's2', // CORRIGIDO: Envia direto para a aba de Qualificação (s2)
        status: 'open',
        priority: 'medium',
        ownerId: lead.ownerId || 'admin123',
        negotiationType: '',
        prospectingDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: lead.notes || '',
      });
      
      toast.success(`${oppTitle} adicionado ao Funil!`);
      navigate('/funil');
    } catch (e) { toast.error('Erro ao mover lead.'); }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Excluir permanentemente o lead "${name}"?`)) return;
    try {
      await leadsRepo.delete(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Lead excluído!');
    } catch (e) { toast.error('Erro ao excluir lead.'); }
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rawValue = fd.get('value') ? parseFloat(fd.get('value').replace(',', '.')) : 0;
    
    const leadData = {
      name: fd.get('name'),
      contactName: fd.get('contactName'),
      responsible: fd.get('responsible'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      source: fd.get('source'),
      score: parseInt(fd.get('score')) || 50,
      value: rawValue,
      notes: fd.get('notes')
    };

    try {
      if (editingLead) {
        await leadsRepo.update(editingLead.id, leadData);
        setLeads(prev => prev.map(l => l.id === editingLead.id ? { ...l, ...leadData } : l));
        toast.success('Lead atualizado!');
      } else {
        const newLead = await leadsRepo.create({ ...leadData, status: 'new', ownerId: 'admin123' });
        setLeads(prev => [...prev, newLead]);
        toast.success('Lead registrado!');
      }
      setCreateOpen(false);
      setEditingLead(null);
    } catch(e) { toast.error('Erro ao salvar lead.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="text-transjordano-blue-800" size={24} /> Leads & Contatos</h2>
          <p className="text-sm text-gray-500">Gestão de leads e parceiros comerciais.</p>
        </div>
        <Button onClick={() => { setEditingLead(null); setCreateOpen(true); }} className="gap-2"><Plus size={16} /> Novo Cadastro</Button>
      </div>

      <Dialog.Root open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if(!open) setEditingLead(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-2xl w-[90vw] max-w-2xl z-50 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <Dialog.Title className="text-lg font-bold text-gray-900">{editingLead ? 'Editar Lead' : 'Cadastrar Nova Empresa'}</Dialog.Title>
              <button onClick={() => { setCreateOpen(false); setEditingLead(null); }} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveLead} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                  <input required name="name" defaultValue={editingLead?.name || ''} className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Indústria XYZ"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente/Contato</label>
                  <input name="contactName" defaultValue={editingLead?.contactName || ''} className="w-full border rounded-lg px-3 py-2" placeholder="Ex: João Silva"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profissional Responsável</label>
                  {/* ALTERADO: Barra rolável com os profissionais definidos */}
                  <select name="responsible" defaultValue={editingLead?.responsible || ''} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Selecione o responsável...</option>
                    <option value="Igor Mariano">Igor Mariano</option>
                    <option value="Cristiane Pinheiro">Cristiane Pinheiro</option>
                    <option value="Fabiano Varjão">Fabiano Varjão</option>
                    <option value="Daniel">Daniel</option>
                    <option value="Paulo Henrique">Paulo Henrique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input required name="phone" defaultValue={editingLead?.phone || ''} className="w-full border rounded-lg px-3 py-2" placeholder="(00) 00000-0000"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Corporativo</label>
                  <input type="email" name="email" defaultValue={editingLead?.email || ''} className="w-full border rounded-lg px-3 py-2" placeholder="contato@empresa.com"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origem do Lead</label>
                  <select name="source" defaultValue={editingLead?.source || 'Prospecção Ativa'} className="w-full border rounded-lg px-3 py-2">
                    <option value="Prospecção Ativa">Prospecção Ativa</option>
                    <option value="Inbound">Inbound (Site)</option>
                    <option value="Feira/Evento">Feira / Evento</option>
                    <option value="Indicação">Indicação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><DollarSign size={16} className="text-transjordano-green-600"/> Valor Estimado (R$)</label>
                  <input type="number" step="0.01" name="value" defaultValue={editingLead?.value || ''} className="w-full border rounded-lg px-3 py-2" placeholder="Ex: 15000.00"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score (Termômetro 0-100)</label>
                  <input type="number" name="score" defaultValue={editingLead?.score ?? 50} min="0" max="100" className="w-full border rounded-lg px-3 py-2"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações Gerais</label>
                  <textarea name="notes" rows="3" defaultValue={editingLead?.notes || ''} className="w-full border rounded-lg px-3 py-2 resize-none"></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); setEditingLead(null); }}>Cancelar</Button>
                <Button type="submit">{editingLead ? 'Salvar Alterações' : 'Guardar Registo'}</Button>
              </div>
