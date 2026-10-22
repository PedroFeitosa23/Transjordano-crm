import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { leadsRepo, opportunitiesRepo } from '@/services/repositories';
import { Users, Phone, Mail, Building2, ArrowRightLeft, Plus, X, DollarSign, Trash2, Edit2, FileSpreadsheet, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';

export function ContactsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' ou 'export'
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
        stageId: 's2', // Qualificação
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

  // Funções de Excel / CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error('Não há leads para exportar.');
      return;
    }
    const headers = ['Empresa', 'Contato', 'Responsavel', 'Telefone', 'Email', 'Origem', 'Score', 'Valor', 'Observacoes'];
    const rows = leads.map(l => [
      `"${l.name || ''}"`,
      `"${l.contactName || ''}"`,
      `"${l.responsible || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.source || ''}"`,
      l.score ?? 50,
      l.value || 0,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_transjordano.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leads exportados com sucesso!');
  };

  const handleImportCSV = (e) => {
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
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (cols.length >= 1) {
            const clean = (val) => val ? val.trim().replace(/^"(.*)"$/, '').replace(/""/g, '"') : '';
            const leadData = {
              name: clean(cols[0]) || 'Empresa Importada',
              contactName: clean(cols[1]),
              responsible: clean(cols[2]),
              phone: clean(cols[3]) || '(00) 00000-0000',
              email: clean(cols[4]),
              source: clean(cols[5]) || 'Planilha',
              score: parseInt(cols[6]) || 50,
              value: parseFloat(cols[7]) || 0,
              notes: clean(cols[8]),
              status: 'new',
              ownerId: 'admin123'
            };
            const created = await leadsRepo.create(leadData);
            setLeads(prev => [...prev, created]);
            count++;
          }
        }
        toast.success(`${count} leads importados com sucesso!`);
        setActiveTab('leads');
      } catch (err) {
        toast.error('Erro ao processar o arquivo CSV.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="text-transjordano-blue-800" size={24} /> Leads & Contatos</h2>
          <p className="text-sm text-gray-500">Gestão de leads e parceiros comerciais.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1 border">
            <button onClick={() => setActiveTab('leads')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'leads' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Tabela de Leads</button>
            <button onClick={() => setActiveTab('export')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${activeTab === 'export' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
              <FileSpreadsheet size={14} /> Exportação / Excel
            </button>
          </div>
          {activeTab === 'leads' && (
            <Button onClick={() => { setEditingLead(null); setCreateOpen(true); }} className="gap-2"><Plus size={16} /> Novo Cadastro</Button>
          )}
        </div>
      </div>

      {activeTab === 'export' ? (
        <Card className="p-8 max-w-xl mx-auto space-y-6 text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Gerir Dados via Excel (CSV)</h3>
            <p className="text-sm text-gray-500 mt-1">Exporte sua base atual para backup ou importe novos leads de planilhas antigas.</p>
          </div>
          <div className="flex flex-col gap-4 pt-4 border-t">
            <Button onClick={handleExportCSV} className="gap-2 justify-center bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download size={16} /> Exportar Leads para Excel (.CSV)
            </Button>
            <div className="relative">
              <input type="file" accept=".csv" onChange={handleImportCSV} className="absolute inset-0 opacity-0 cursor-pointer w-full" id="import-leads" />
              <label htmlFor="import-leads" className="flex items-center justify-center gap-2 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors text-sm">
                <Upload size={16} /> Importar Leads de Planilha Excel (.CSV)
              </label>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Contato / Empresa</th>
                  <th className="px-6 py-3">Responsável</th>
                  <th className="px-6 py-3">Telefone</th>
                  <th className="px-6 py-3">Valor Est.</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {l.contactName ? <span className="block font-bold">{l.contactName}</span> : null}
                      <span className="flex items-center gap-1.5 text-xs text-gray-500"><Building2 size={12} /> {l.name}</span>
                    </td>
                    <td className="px-6 py-4">{l.responsible || '-'}</td>
                    <td className="px-6 py-4"><span className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/> {l.phone}</span></td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{l.value ? `R$ ${Number(l.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}</td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <Button variant="secondary" onClick={() => handleMoveToFunnel(l)} className="text-xs py-1.5 px-2.5 gap-1 bg-transjordano-green-50 text-transjordano-green-700 hover:bg-transjordano-green-100 border-transjordano-green-200"><ArrowRightLeft size={13} /> Funil</Button>
                      <Button variant="ghost" onClick={() => { setEditingLead(l); setCreateOpen(true); }} className="text-xs py-1.5 px-2 text-blue-600 hover:bg-blue-50"><Edit2 size={14} /></Button>
                      <Button variant="ghost" onClick={() => handleDeleteLead(l.id, l.name)} className="text-xs py-1.5 px-2 text-red-600 hover:bg-red-50"><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal de Cadastro/Edição */}
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
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
