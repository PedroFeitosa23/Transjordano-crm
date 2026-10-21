import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { leadsRepo, opportunitiesRepo } from '@/services/repositories';
import { Users, Phone, Mail, Building2, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function ContactsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
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
        stageId: 'prospecting',
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

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-transjordano-blue-800" size={24} /> Leads & Contatos
        </h2>
        <p className="text-sm text-gray-500">Gestão de leads e parceiros comerciais da Transjordano.</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Empresa / Nome</th>
                <th className="px-6 py-3">Telefone</th>
                <th className="px-6 py-3">E-mail</th>
                <th className="px-6 py-3">Origem</th>
                <th className="px-6 py-3">Status</th>
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
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-transjordano-blue-50 text-transjordano-blue-800 rounded-full text-xs font-semibold">{l.status}</span></td>
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
