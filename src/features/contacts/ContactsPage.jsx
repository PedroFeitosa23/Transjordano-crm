import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { leadsRepo, opportunitiesRepo } from '@/services/repositories';
import { Users, Phone, Mail, Building2, ArrowRightLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';

export function ContactsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await leadsRepo.list();
        setLeads(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMoveToFunnel = async (lead) => {
    try {
      await opportunitiesRepo.create({
        title: `Negociação - ${lead.name}`,
        contactId: lead.id,
        valueCents: 0,
        stageId: 's1', // ID correto para a primeira coluna
        status: 'open',
        priority: 'medium',
        ownerId: lead.ownerId || 'admin123',
        origin: '',
        destination: '',
      });
      
      toast.success(`${lead.name} foi adicionado ao Funil de Vendas!`);
      navigate('/funil');
    } catch (e) {
      toast.error('Erro ao mover lead para o funil.');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const newLead = await leadsRepo.create({
        name: fd.get('name'),
        phone: fd.get('phone'),
        email: fd.get('email'),
        source: fd.get('source'),
        score: parseInt(fd.get('score')) || 50,
        status: 'new',
        ownerId: 'admin123',
        notes: fd.get('notes')
      });
      setLeads(prev => [...prev, newLead]);
      toast.success('Empresa registrada com sucesso!');
      setCreateOpen(false);
    } catch(e) { toast.error('Erro ao criar lead.'); }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-transjordano-blue-800" size={24} /> Leads & Contatos
          </h2>
          <p className="text-sm text-gray-500">Gestão de leads e parceiros comerciais da Transjordano.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus size={16} /> Novo Cadastro</Button>
      </div>

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-2xl w-[90vw] max-w-2xl z-50 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <Dialog.Title className="text-lg font-bold text-gray-900">Cadastrar Nova Empresa (Detalhado)</Dialog.Title>
              <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateLead} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                  <input required name="name" className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Indústria Química Beta"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input required name="phone" className="w-full border rounded-lg px-3 py-2" placeholder="(00) 00000-0000"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Corporativo</label>
                  <input type="email" name="email" className="w-full border rounded-lg px-3 py-2" placeholder="contato@empresa.com"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origem do Lead</label>
                  <select name="source" className="w-full border rounded-lg px-3 py-2">
                    <option value="Prospecção Ativa">Prospecção Ativa</option>
                    <option value="Inbound">Inbound (Site)</option>
                    <option value="Feira/Evento">Feira / Evento</option>
                    <option value="Indicação">Indicação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score (Termômetro 0-100)</label>
                  <input type="number" name="score" defaultValue="50" min="0" max="100" className="w-full border rounded-lg px-3 py-2"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações / Perfil de Carga</label>
                  <textarea name="notes" rows="3" className="w-full border rounded-lg px-3 py-2 resize-none" placeholder="Detalhes da frota atual, tipo de produtos, etc..."></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Registo</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Empresa / Nome</th>
                <th className="px-6 py-3">Telefone</th>
                <th className="px-6 py-3">E-mail</th>
                <th className="px-6 py-3">Origem</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" /> {l.name}
                  </td>
                  <td className="px-6 py-4"><span className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/> {l.phone}</span></td>
                  <td className="px-6 py-4"><span className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> {l.email}</span></td>
                  <td className="px-6 py-4">{l.source || 'Manual'}</td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="secondary" 
                      onClick={() => handleMoveToFunnel(l)}
                      className="text-xs py-1.5 px-3 gap-1.5 bg-transjordano-green-50 text-transjordano-green-700 hover:bg-transjordano-green-100 hover:text-transjordano-green-800 border border-transjordano-green-200"
                    >
                      <ArrowRightLeft size={14} /> Funil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
