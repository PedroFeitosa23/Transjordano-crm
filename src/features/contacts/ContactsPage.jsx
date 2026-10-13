import React, { useEffect, useState } from 'react';
import { contactsRepo } from '@/services/repositories';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/features/auth/can';
import { Search, Filter, Plus, Building2, User2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const filters = can(user, 'view:all_contacts') ? {} : { ownerId: user.uid };
      setContacts(await contactsRepo.list(filters));
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.document && c.document.includes(searchTerm)));

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-gray-200 rounded-lg w-full max-w-sm"></div><div className="h-96 bg-gray-200 rounded-xl"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar contato (Nome ou CPF/CNPJ)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-transjordano-green-500 text-sm"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" className="gap-2 flex-1 sm:flex-none"><Filter size={16}/> Filtros</Button>
          <Button className="gap-2 flex-1 sm:flex-none"><Plus size={16}/> Novo Contato</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Nome / Empresa</th>
                <th scope="col" className="px-6 py-4 font-medium">Documento</th>
                <th scope="col" className="px-6 py-4 font-medium">Contato</th>
                <th scope="col" className="px-6 py-4 font-medium">Origem</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? filtered.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${contact.type==='company' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {contact.type === 'company' ? <Building2 size={16}/> : <User2 size={16}/>}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        {contact.tags.map(t => <Badge key={t} variant="info" className="mr-1 mt-1">{t}</Badge>)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">{contact.document ? contact.document.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") : '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{contact.email || '—'}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{contact.phone || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="neutral">{contact.source}</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-transjordano-blue-600 font-semibold hover:bg-transjordano-blue-50">Ver Detalhes</Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Nenhum contato encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
