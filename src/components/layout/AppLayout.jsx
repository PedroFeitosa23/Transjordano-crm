import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronDown, Search, Download, Plus, Menu, LogOut, X, Sparkles, Building2, Briefcase } from 'lucide-react';
import { NAV_ITEMS } from '@/app/nav.config';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { leadsRepo, opportunitiesRepo } from '@/services/repositories';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ leads: [], opportunities: [] });
  const [searching, setSearching] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);

  const currentTitle = NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Sistema';

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSearchResults({ leads: [], opportunities: [] });
        return;
      }
      setSearching(true);
      try {
        const [allLeads, allOpps] = await Promise.all([
          leadsRepo.list().catch(() => []),
          opportunitiesRepo.list().catch(() => [])
        ]);

        const query = searchQuery.toLowerCase();
        
        const filteredLeads = allLeads.filter(l => 
          (l.name && l.name.toLowerCase().includes(query)) ||
          (l.contactName && l.contactName.toLowerCase().includes(query)) ||
          (l.phone && l.phone.includes(query)) ||
          (l.responsible && l.responsible.toLowerCase().includes(query))
        );

        const filteredOpps = allOpps.filter(o => 
          (o.title && o.title.toLowerCase().includes(query)) ||
          (o.negotiationType && o.negotiationType.toLowerCase().includes(query))
        );

        setSearchResults({ leads: filteredLeads, opportunities: filteredOpps });
      } catch (err) {
        console.error("Erro na busca global", err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleExport = () => {
    if (location.pathname.includes('leads') || location.pathname.includes('contatos')) {
      toast.info('Utilize a aba "Exportação / Excel" na página de Leads.');
    } else {
      toast.info('Utilize a aba "Exportação / Excel" na página do Funil de Vendas.');
    }
  };

  const handleQuickCreate = async (e) => {
     e.preventDefault();
     const fd = new FormData(e.target);
     try {
       await leadsRepo.create({ name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'), score: 50, source: 'Manual', status: 'new', ownerId: user.uid });
       toast.success('Novo lead registrado!');
       setCreateOpen(false);
       navigate('/funil');
     } catch(e) { toast.error('Erro ao criar lead'); }
  };

  const NavLinks = ({ onClick }) => {
    const regularItems = NAV_ITEMS.filter(i => !i.isAi);
    const aiItems = NAV_ITEMS.filter(i => i.isAi);

    return (
      <>
        <div className="mb-6">
          <p className="text-[10px] text-transjordano-blue-300 font-bold mb-3 tracking-widest uppercase px-4">Operação</p>
          <div className="space-y-1">
            {regularItems.map((item) => (
              <NavLink key={item.id} to={item.path} onClick={onClick} className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors border-l-4 ${isActive ? 'bg-white/10 border-transjordano-green-500 text-white' : 'border-transparent text-transjordano-blue-200 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] text-purple-300/80 font-bold mb-3 tracking-widest uppercase px-4 flex items-center gap-1.5"><Sparkles size={12}/> Inteligência</p>
          <div className="space-y-1">
            {aiItems.map((item) => (
              <NavLink key={item.id} to={item.path} onClick={onClick} className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors border-l-4 ${isActive ? 'bg-purple-900/40 border-purple-400 text-purple-100' : 'border-transparent text-transjordano-blue-200 hover:bg-purple-900/20 hover:text-purple-200'}`}>
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-dvh bg-gray-50 font-sans overflow-hidden">
      <aside className="w-64 bg-[#002b5c] text-white flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 flex items-center justify-center border-b border-gray-700/50 bg-[#002046]/30 shrink-0">
             <button 
               onClick={() => navigate('/')} 
               className="bg-white px-4 py-3 rounded-xl shadow-md hover:scale-105 transition-transform w-full flex justify-center cursor-pointer"
             >
               <Logo />
             </button>
          </div>
          <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar"><NavLinks /></nav>
        </div>
        
        <div className="p-4 border-t border-gray-700/50 bg-[#002046]/50 shrink-0">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-full flex items-center justify-between text-transjordano-blue-200 hover:text-white transition-colors outline-none rounded-md p-2">
                <div className="flex items-center gap-2 text-left">
                  <ShieldCheck size={20} className="text-transjordano-green-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="font-medium text-sm truncate">{user.name}</span>
                    <span className="text-xs opacity-75 capitalize">Comercial</span>
                  </div>
                </div>
                <ChevronDown size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[200px] bg-white rounded-lg shadow-pop border border-gray-200 p-1 mb-2 z-50 animate-in fade-in zoom-in-95" sideOffset={5}>
                <div className="px-2 py-2 border-b border-gray-100 mb-1"><p className="text-sm font-medium text-gray-900">{user.name}</p></div>
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-2 text-sm text-red-600 cursor-pointer outline-none hover:bg-red-50 rounded-md" onSelect={logout}><LogOut size={16} /> Terminar Sessão</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </aside>

      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in" />
          <Dialog.Content className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-[#002b5c] text-white shadow-xl z-50 flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left">
            <div className="p-4 flex items-center justify-between border-b border-gray-700/50 bg-[#002046]/30">
              <button 
                onClick={() => { setMobileOpen(false); navigate('/'); }} 
                className="bg-white px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer"
              >
                <Logo compact />
              </button>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white"><X size={24}/></button>
            </div>
            <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar"><NavLinks onClick={() => setMobileOpen(false)} /></nav>
            <div className="p-4 border-t border-gray-700/50 bg-[#002046]/50"><Button variant="danger" className="w-full" onClick={logout}>Sair</Button></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[15%] left-[50%] translate-x-[-50%] bg-white rounded-xl shadow-2xl w-[90vw] max-w-xl z-50 overflow-hidden focus:outline-none flex flex-col max-h-[70vh]">
             <div className="flex items-center p-3 border-b bg-gray-50">
                <Search className="text-gray-400 ml-2" size={20} />
                <input 
                  autoFocus 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o nome do cliente, empresa ou negócio..." 
                  className="w-full p-2 focus:outline-none text-gray-800 bg-transparent text-sm" 
                />
                <Button type="button" variant="ghost" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-gray-400">Fechar</Button>
             </div>

             <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {searching && <p className="text-center text-xs text-gray-400 py-4">A procurar...</p>}
                
                {!searching && searchQuery.trim().length >= 2 && searchResults.leads.length === 0 && searchResults.opportunities.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-6">Nenhum resultado encontrado para "{searchQuery}".</p>
                )}

                {searchQuery.trim().length < 2 && (
                  <p className="text-center text-xs text-gray-400 py-6">Digite pelo menos 2 caracteres para iniciar a busca instantânea...</p>
                )}

                {searchResults.leads.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Building2 size={14}/> Leads e Empresas</h4>
                    <div className="space-y-1">
                      {searchResults.leads.map(lead => (
                        <div 
                          key={lead.id} 
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); setSelectedLead(lead); }}
                          className="p-2.5 hover:bg-blue-50 rounded-lg cursor-pointer border border-transparent hover:border-blue-100 flex justify-between items-center transition-all"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{lead.name}</p>
                            <p className="text-xs text-gray-500">{lead.contactName ? `Contato: ${lead.contactName}` : ''} {lead.phone ? `• ${lead.phone}` : ''}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Ver Ficha</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.opportunities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Briefcase size={14}/> Oportunidades no Funil</h4>
                    <div className="space-y-1">
                      {searchResults.opportunities.map(opp => (
                        <div 
                          key={opp.id} 
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); setSelectedOpp(opp); }}
                          className="p-2.5 hover:bg-emerald-50 rounded-lg cursor-pointer border border-transparent hover:border-emerald-100 flex justify-between items-center transition-all"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{opp.title}</p>
                            <p className="text-xs text-gray-500">Tipo: {opp.negotiationType || 'Geral'} • R$ {(opp.valueCents/100).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                          </div>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">Ver Ficha</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl p-6 shadow-pop w-[90vw] max-w-md z-[70] focus:outline-none">
            {selectedLead && (
              <>
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">{selectedLead.name}</Dialog.Title>
                    <p className="text-sm text-gray-500 font-medium mt-1">Ficha Completa do Lead</p>
                  </div>
                  <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"><X size={20}/></button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Contato</span><p className="text-sm font-medium text-gray-900">{selectedLead.contactName || '-'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Responsável</span><p className="text-sm font-medium text-gray-900">{selectedLead.responsible || '-'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Telefone</span><p className="text-sm font-medium text-gray-900">{selectedLead.phone || '-'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">E-mail</span><p className="text-sm font-medium text-gray-900">{selectedLead.email || '-'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Origem</span><p className="text-sm font-medium text-gray-900">{selectedLead.source || '-'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Valor Estimado</span><p className="text-sm font-bold text-transjordano-green-600">{selectedLead.value ? `R$ ${Number(selectedLead.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}</p></div>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase text-gray-400 block mb-2">Observações</span>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px] whitespace-pre-wrap">{selectedLead.notes || 'Nenhuma observação registrada.'}</p>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!selectedOpp} onOpenChange={(open) => !open && setSelectedOpp(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl p-6 shadow-pop w-[90vw] max-w-md z-[70] focus:outline-none">
            {selectedOpp && (
              <>
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">{selectedOpp.title}</Dialog.Title>
                    <p className="text-sm text-gray-500 font-medium mt-1">Detalhes do Funil de Vendas</p>
                  </div>
                  <button onClick={() => setSelectedOpp(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"><X size={20}/></button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Valor</span><p className="text-sm font-bold text-transjordano-green-600">{selectedOpp.valueCents ? `R$ ${(selectedOpp.valueCents/100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Carga / Tipo</span><p className="text-sm font-medium text-gray-900">{selectedOpp.negotiationType || '-'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Data Prospecção</span><p className="text-sm font-medium text-gray-900">{selectedOpp.prospectingDate ? new Date(selectedOpp.prospectingDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Data Término</span><p className="text-sm font-medium text-gray-900">{selectedOpp.endDate ? new Date(selectedOpp.endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</p></div>
                    <div><span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Status</span><p className="text-sm font-medium uppercase">{selectedOpp.status === 'won' ? 'Ganho' : selectedOpp.status === 'lost' ? 'Perdido' : 'Em Andamento'}</p></div>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase text-gray-400 block mb-2">Observações</span>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px] whitespace-pre-wrap">{selectedOpp.notes || 'Nenhuma observação registrada.'}</p>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl p-6 shadow-pop w-[90vw] max-w-md z-50 focus:outline-none">
            <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900">Novo Lead Rápido</Dialog.Title>
            <form onSubmit={handleQuickCreate} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nome da Empresa</label><input required name="name" className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Indústria XYZ"/></div>
              <div><label className="block text-sm font-medium mb-1">Telefone</label><input required name="phone" className="w-full border rounded-lg px-3 py-2" placeholder="Ex: (19) 99999-9999"/></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input required type="email" name="email" className="w-full border rounded-lg px-3 py-2" placeholder="Ex: contato@xyz.com"/></div>
              <div className="flex justify-end gap-2 mt-6"><Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button><Button type="submit">Cadastrar</Button></div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md" onClick={() => setMobileOpen(true)}><Menu size={24} /></button>
            <h1 className="text-xl font-semibold text-gray-900 truncate">{currentTitle}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Busca global..." onClick={() => setSearchOpen(true)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-transjordano-green-500 focus:ring-1 focus:ring-transjordano-green-500 text-sm w-48 lg:w-64 cursor-pointer" readOnly />
            </div>
            <Button variant="secondary" onClick={handleExport} className="hidden sm:flex gap-2"><Download size={16} /> Exportar</Button>
            <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus size={16} /> Nova</Button>
          </div>
        </header>

        <main id="conteudo" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto w-full flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
