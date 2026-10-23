import React, { useEffect, useState } from 'react';
import { leadsRepo, opportunitiesRepo } from '@/services/repositories';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/features/auth/can';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { Building2, FileSpreadsheet, Download, Upload, Plus, Phone, User, Search, Trash2, ArrowRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export function ContactsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    contactName: '', 
    phone: '', 
    email: '', 
    responsible: '', 
    source: 'Prospecção Ativa',
    notes: '', 
    value: 0 
  });

  const equipeComercial = [
    "ALEXEI", "EGESIEL", "JORDANO", "DANIEL", "TIAGO", 
    "FREDERICO", "NERY", "CRISTIANE", "BELLODI", "PH", "FABIANO"
  ];

  useEffect(() => {
    loadLeads();
  }, [user]);

  async function loadLeads() {
    try {
      setLoading(true);
      const filters = can(user, 'view:all_leads') ? {} : { ownerId: user.uid };
      const data = await leadsRepo.list(filters);
      setLeads(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      toast.error('Erro ao carregar os contatos/leads.');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      if (selectedLead) {
        await leadsRepo.update(selectedLead.id, formData);
        toast.success('Ficha atualizada com sucesso!');
      } else {
        await leadsRepo.create({
          ...formData,
          ownerId: user.uid || 'admin123',
          createdAt: new Date().toISOString()
        });
        toast.success('Novo contato cadastrado com sucesso!');
      }
      setModalOpen(false);
      setSelectedLead(null);
      setFormData({ name: '', contactName: '', phone: '', email: '', responsible: '', source: 'Prospecção Ativa', notes: '', value: 0 });
      loadLeads();
    } catch (err) {
      toast.error('Erro ao salvar os dados.');
    }
  };

  const handleDeleteLead = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir permanentemente este registro?')) return;
    try {
      await leadsRepo.delete(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Registro excluído.');
    } catch (err) {
      toast.error('Erro ao excluir registro.');
    }
  };

  const handleSendToPipeline = async (lead, e) => {
    e.stopPropagation();
    if (!confirm(`Deseja enviar a empresa ${lead.name} para o Funil de Vendas?`)) return;
    
    try {
      await opportunitiesRepo.create({
        title: lead.name,
        valueCents: lead.value ? Math.round(lead.value * 100) : 0,
        negotiationType: 'Geral',
        prospectingDate: new Date().toISOString().split('T')[0],
        status: 'open',
        stageId: 's2', 
        priority: 'medium',
        ownerId: user.uid || 'admin123',
        notes: `Contato Original: ${lead.contactName || '-'}\nTelefone: ${lead.phone || '-'}\nResponsável Comercial: ${lead.responsible || '-'}\n\nObservações do Lead:\n${lead.notes || ''}`,
        createdAt: new Date().toISOString()
      });
      toast.success(`${lead.name} enviado para o Funil com sucesso!`);
    } catch (err) {
      toast.error('Erro ao enviar para o Funil de Vendas.');
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error('Não há dados para exportar.');
      return;
    }
    const headers = ['NomeEmpresa', 'Contato', 'Telefone', 'Email', 'Responsavel', 'Origem', 'ValorEstimado', 'Observacoes'];
    const rows = leads.map(l => [
      `"${l.name || ''}"`,
      `"${l.contactName || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.responsible || ''}"`,
      `"${l.source || ''}"`,
      l.value || 0,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "base_contatos_transjordano.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Base exportada com sucesso!');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) {
          toast.error('O arquivo está vazio.');
          return;
        }

        let count = 0;
        const isTxt = file.name.endsWith('.txt');
        const startIndex = isTxt ? 0 : 1; 

        for (let i = startIndex; i < lines.length; i++) {
          const cols = isTxt ? lines[i].split('\t') : lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          
          if (cols.length >= 2 || (isTxt && cols.length >= 1)) {
            const clean = (val) => val ? val.trim().replace(/^"(.*)"$/, '').replace(/""/g, '"') : '';
            let leadData;

            if (isTxt) {
              const titulo = clean(cols[0]);
              const referencia = clean(cols[1]);
              const cliente = clean(cols[2]);
              const tipoCarga = clean(cols[3]);
              const detalhes = clean(cols[4]);
              const responsavel = clean(cols[6])?.toUpperCase() || '';
              const dataInicio = clean(cols[7]);
              const dataFim = clean(cols[8]);

              leadData = {
                name: cliente || titulo || 'Empresa Importada',
                contactName: 'Não informado',
                phone: '',
                email: '',
                responsible: equipeComercial.includes(responsavel) ? responsavel : 'Equipe Comercial',
                source: 'Importação TXT',
                value: 0,
                notes: `Título: ${titulo}\nRef: ${referencia}\nTipo: ${tipoCarga}\nDetalhes: ${detalhes}\nPeríodo: ${dataInicio} até ${dataFim}`,
                ownerId: user.uid || 'admin123',
                createdAt: new Date().toISOString()
              };
            } else {
              leadData = {
                name: clean(cols[0]) || 'Empresa Importada',
                contactName: clean(cols[1]),
                phone: clean(cols[2]),
                email: clean(cols[3]),
                responsible: clean(cols[4]),
                source: 'Importação CSV',
                value: parseFloat(clean(cols[5])) || 0,
                notes: clean(cols[6]),
                ownerId: user.uid || 'admin123',
                createdAt: new Date().toISOString()
              };
            }

            await leadsRepo.create(leadData);
            count++;
          }
        }

        toast.success(`${count} registros importados com sucesso!`);
        setActiveTab('list');
        loadLeads();
      } catch (err) {
        toast.error('Erro ao processar o arquivo de importação.');
      }
    };
    reader.readAsText(file);
  };

  const filteredLeads = leads.filter(l => 
    (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.contactName && l.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.responsible && l.responsible.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">A carregar base de dados...</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Gestão de Contatos / Leads</h2>
            <p className="text-xs text-gray-500">Centralize e qualifique as empresas antes de enviar ao Funil</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1 border border-gray-200">
            <button onClick={() => setActiveTab('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Lista Completa</button>
            <button onClick={() => setActiveTab('import')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${activeTab === 'import' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              <FileSpreadsheet size={14} /> Importar / Exportar
            </button>
          </div>
          <Button onClick={() => { setSelectedLead(null); setFormData({ name: '', contactName: '', phone: '', email: '', responsible: '', source: 'Prospecção Ativa', notes: '', value: 0 }); setModalOpen(true); }} className="gap-1 bg-[#A3C43B] hover:bg-[#829d2f] text-white">
            <Plus size={16} /> Novo Cadastro
          </Button>
        </div>
      </div>

      {activeTab === 'import' ? (
        <Card className="p-8 max-w-xl mx-auto space-y-6 text-center mt-6 bg-white border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Importar Dados (Bloco de Notas / Excel)</h3>
            <p className="text-sm text-gray-500 mt-1">Carregue o seu ficheiro .txt com os registos de frete ou descarregue a base atual em .csv.</p>
          </div>
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
            <Button onClick={handleExportCSV} className="gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white">
              <Download size={16} /> Exportar Base Atual (.CSV)
            </Button>
            <div className="relative">
              <input type="file" accept=".csv, .txt" onChange={handleImportFile} className="absolute inset-0 opacity-0 cursor-pointer w-full" id="import-leads-file" />
              <label htmlFor="import-leads-file" className="flex items-center justify-center gap-2 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg cursor-pointer transition-colors text-sm">
                <Upload size={16} /> Importar Arquivo (.TXT ou .CSV)
              </label>
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Pesquisar por empresa, contato ou responsável..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#A3C43B]" 
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total: {filteredLeads.length} cadastros</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Nenhum registro encontrado. Utilize o botão "Novo Cadastro" ou importe um arquivo.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredLeads.map(lead => (
                  <div 
                    key={lead.id} 
                    onClick={() => { setSelectedLead(lead); setFormData(lead); setModalOpen(true); }}
                    className="p-4 hover:bg-blue-50/40 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{lead.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {lead.contactName && <span className="flex items-center gap-1"><User size={12}/> {lead.contactName}</span>}
                        {lead.phone && <span className="flex items-center gap-1"><Phone size={12}/> {lead.phone}</span>}
                        {lead.responsible && (
                          <span className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium shadow-sm">
                            Resp: {lead.responsible}
                          </span>
                        )}
                        {lead.source && <span className="text-gray-400 italic hidden md:inline-block">({lead.source})</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-600 tabular-nums mr-3">
                        {lead.value ? `R$ ${Number(lead.value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'R$ 0,00'}
                      </span>
                      <button onClick={(e) => handleSendToPipeline(lead, e)} className="text-gray-600 hover:text-white bg-gray-100 hover:bg-[#002b5c] p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium shadow-sm border border-gray-200 hover:border-[#002b5c]" title="Jogar para o Funil">
                        <ArrowRight size={14} /> Funil
                      </button>
                      <button onClick={(e) => handleDeleteLead(lead.id, e)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg transition-colors" title="Excluir Registro">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CRIAR / EDITAR */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border border-gray-200 rounded-xl p-6 shadow-2xl w-[90vw] max-w-lg z-50 focus:outline-none">
            <Dialog.Title className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">{selectedLead ? 'Ficha do Cliente' : 'Novo Cadastro'}</Dialog.Title>
            
            <form onSubmit={handleSaveLead} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Nome da Empresa / Cliente *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#A3C43B] focus:ring-1 focus:ring-[#A3C43B] transition-all" placeholder="Ex: Raízen, Cofco, etc." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Contato na Empresa</label>
                  <input type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#A3C43B] focus:ring-1 focus:ring-[#A3C43B] transition-all" placeholder="Nome da pessoa" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Telefone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#A3C43B] focus:ring-1 focus:ring-[#A3C43B] transition-all" placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Responsável Comercial</label>
                  <select 
                    value={formData.responsible} 
                    onChange={e => setFormData({...formData, responsible: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-[#A3C43B] focus:ring-1 focus:ring-[#A3C43B] transition-all"
                  >
                    <option value="">Selecione...</option>
                    {equipeComercial.map(nome => (
                      <option key={nome} value={nome}>{nome}</option>
                    ))}
                    <option value="Equipe Comercial">Geral (Equipe Comercial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Origem do Cadastro</label>
                  <select 
                    value={formData.source} 
                    onChange={e => setFormData({...formData, source: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-[#A3C43B] focus:ring-1 focus:ring-[#A3C43B] transition-all"
                  >
                    <option value="Prospecção Ativa">Prospecção Ativa</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Site / E-mail">Site / E-mail</option>
                    <option value="Importação TXT">Importação (Sistema)</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Valor Estimado / Fechado (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">R$</span>
                  <input type="number" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-2 text-sm focus:outline-none focus:border-[#A3C43B] focus:ring-1 focus:ring-[#A3C43B] transition-all font-medium text-gray-900" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Observações / Detalhes Operacionais</label>
                <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#A3C43B] focus:ring-1 focus:ring-[#A3C43B] transition-all bg-gray-50 focus:bg-white resize-none" placeholder="Adicione as informações de rotas, tipo de carga, datas..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-500 hover:bg-gray-100 hover:text-gray-900">Cancelar</Button>
                <Button type="submit" className="bg-[#A3C43B] hover:bg-[#829d2f] text-white shadow-sm font-medium px-6">Salvar Ficha</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
