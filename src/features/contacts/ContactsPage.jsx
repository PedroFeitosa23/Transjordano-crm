import React, { useEffect, useState } from 'react';
import { contactsRepo, leadsRepo, opportunitiesRepo } from '@/services/repositories';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/features/auth/can';
import { Search, Plus, Building2, User2, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDoc, stripDoc, dateBR } from '@/lib/format';
import { toast } from 'sonner';

export function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'contacts'

  useEffect(() => {
    async function load() {
      const filters = can(user, 'view:all_contacts') ? {} : { ownerId: user.uid };
      const [c, l] = await Promise.all([contactsRepo.list(filters), leadsRepo.list(filters)]);
      setContacts(c); setLeads(l); setLoading(false);
    }
    load();
  }, [user]);

  const handleConvertLead = async (leadId) => {
      toast.success("Lead convertido em Conta e Oportunidade! (Simulação)");
      const original = [...leads];
      setLeads(prev => prev.filter(l => l.id !== leadId));
      try {
        await leadsRepo.delete(leadId);
        // Na vida real: calls para contactsRepo.create() e opportunitiesRepo.create()
      } catch(e) { setLeads(original); }
  };

  const filteredContacts = contacts.filter(c => (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.document && stripDoc(c.document).includes(stripDoc(searchTerm)))));
  const filteredLeads = leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-gray-200 rounded-lg w-full max-w-sm"></div><div className="h-96 bg-gray-200 rounded-xl"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Simple Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-lg">
          <button onClick={()=>setActiveTab('leads')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'leads' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Leads Pré-Vendas</button>
          <button onClick={()=>setActiveTab('contacts')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'contacts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Carteira de Clientes</button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-transjordano-green-500 text-sm" />
           </div>
          <Button onClick={()=>toast.info('Novo formulário em breve')} className="gap-2 shrink-0"><Plus size={16}/> Novo</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'contacts' ? (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase border-b border-gray-200">
                  <tr><th className="px-6 py-4 font-medium">Nome / Empresa</th><th className="px-6 py-4 font-medium">Documento</th><th className="px-6 py-4 font-medium">Contato</th><th className="px-6 py-4 font-medium text-right">Ações</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredContacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${contact.type==='company' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{contact.type === 'company' ? <Building2 size={16}/> : <User2 size={16}/>}</div>
                          <div><div className="font-medium text-gray-900">{contact.name}</div></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 tabular">{formatDoc(contact.document)}</td>
                      <td className="px-6 py-4 flex flex-col"><span>{contact.email || '—'}</span><span className="text-xs text-gray-500">{contact.phone}</span></td>
                      <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm" className="text-transjordano-blue-600">Ver</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          ) : (
             <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase border-b border-gray-200">
                  <tr><th className="px-6 py-4 font-medium">Lead Bruto</th><th className="px-6 py-4 font-medium">Contato</th><th className="px-6 py-4 font-medium">Score Qualificação</th><th className="px-6 py-4 font-medium text-right">Ações</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><Zap size={16}/></div>
                          <div><div className="font-medium text-gray-900">{lead.name}</div><div className="text-xs text-gray-500">Desde {dateBR(lead.createdAt)}</div></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 flex flex-col"><span>{lead.email}</span><span className="text-xs text-gray-500">{lead.phone}</span></td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${lead.score > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${lead.score}%`}}></div></div>
                            <span className="text-xs font-semibold">{lead.score}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <Button size="sm" onClick={()=>handleConvertLead(lead.id)} className="bg-transjordano-blue-900 text-white hover:bg-transjordano-blue-800">Converter <ArrowRight size={14} className="ml-1"/></Button>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">Sem leads na caixa de entrada.</td></tr>}
                </tbody>
              </table>
          )}
        </div>
      </Card>
    </div>
  );
}
