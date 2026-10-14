import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronDown, Search, Download, Plus, Menu, LogOut, X, Sparkles, Flame, Target } from 'lucide-react';
import { NAV_ITEMS } from '@/app/nav.config';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { opportunitiesRepo, leadsRepo } from '@/services/repositories';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const currentTitle = NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Sistema';

  if (!user) return <Navigate to="/login" replace />;

  const handleExport = async () => {
     try {
       const opps = await opportunitiesRepo.list();
       const csv = "ID,Titulo,Valor,Status,Data\n" + opps.map(o => `${o.id},"${o.title}",${o.valueCents},${o.status},${o.createdAt}`).join("\n");
       const blob = new Blob([csv], { type: 'text/csv' });
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a'); a.href = url; a.download = 'pipeline_export.csv'; a.click();
       toast.success('Arquivo CSV exportado com sucesso.');
     } catch(e) { toast.error('Erro na exportação'); }
  };

  const handleQuickCreate = async (e) => {
     e.preventDefault();
     const fd = new FormData(e.target);
     try {
       await leadsRepo.create({ name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'), score: 50, source: 'Manual', status: 'new', ownerId: user.uid });
       toast.success('Novo lead registrado!');
       setCreateOpen(false);
       navigate('/leads');
     } catch(e) { toast.error('Erro ao criar lead'); }
  };

  const NavLinks = ({ onClick }) => {
    const regularItems = NAV_ITEMS.filter(i => !i.isAi && i.roles.includes(user.role));
    const aiItems = NAV_ITEMS.filter(i => i.isAi && i.roles.includes(user.role));

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

        {/* AI SMART WIDGETS */}
        <div className="px-4 mt-8 space-y-4">
           {/* Radar Widget */}
           <div className="bg-transjordano-blue-950/50 rounded-lg p-3 border border-transjordano-blue-800/50">
              <div className="flex items-center gap-2 mb-2 text-transjordano-blue-200"><Flame size={14} className="text-orange-400"/><span className="text-xs font-bold uppercase tracking-wider">Radar de Ação</span></div>
              <button onClick={()=>navigate('/funil')} className="text-left w-full text-xs text-transjordano-blue-100 hover:text-white hover:bg-white/5 p-1.5 rounded transition-colors block">
                <strong className="text-orange-300 block mb-0.5">Renovação Frota</strong> 
                <span className="opacity-80">Risco de perda alto. Ligar hoje.</span>
              </button>
           </div>
           
           {/* Meta Widget */}
           <div className="bg-transjordano-blue-950/50 rounded-lg p-3 border border-transjordano-blue-800/50">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-transjordano-blue-200"><Target size={14} className="text-transjordano-green-400"/><span className="text-xs font-bold uppercase tracking-wider">Meta Q4</span></div>
                 <span className="text-xs font-bold text-white">25%</span>
              </div>
              <div className="w-full bg-transjordano-blue-900 rounded-full h-1.5 mb-1.5"><div className="bg-transjordano-green h-1.5 rounded-full" style={{width: '25%'}}></div></div>
              <p className="text-[10px] text-transjordano-blue-300"><span className="text-purple-300 font-medium">IA Previsão:</span> 85% de atingimento.</p>
           </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-dvh bg-gray-50 font-sans overflow-hidden">
      <aside className="w-64 bg-[#002b5c] text-white flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* LOGO COMPACTA NO MENU LATERAL */}
          <div className="p-6 flex items-center justify-center border-b border-gray-700/50 bg-[#002046]/30 shrink-0">
             <Logo compact className="[&_span]:text-white" />
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
                    <span className="text-xs opacity-75 capitalize">{user.role === 'manager' ? 'Gerente' : 'Vendedor'}</span>
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

      {/* MOBILE DRAWER */}
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in" />
          <Dialog.Content className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-[#002b5c] text-white shadow-xl z-50 flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left">
            <div className="p-4 flex items-center justify-between border-b border-gray-700/50 bg-[#002046]/30">
              <Logo compact className="[&_span]:text-white" />
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white"><X size={24}/></button>
            </div>
            <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar"><NavLinks onClick={() => setMobileOpen(false)} /></nav>
            <div className="p-4 border-t border-gray-700/50 bg-[#002046]/50"><Button variant="danger" className="w-full" onClick={logout}>Sair</Button></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* SEARCH MODAL */}
      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-[20%] left-[50%] translate-x-[-50%] bg-white rounded-xl shadow-2xl w-[90vw] max-w-lg z-50 overflow-hidden focus:outline-none">
             <form onSubmit={(e) => { e.preventDefault(); setSearchOpen(false); toast.success('Busca global iniciada...'); navigate('/leads'); }} className="flex items-center p-2 border-b">
                <Search className="text-gray-400 ml-2" size={20} />
                <input autoFocus type="text" placeholder="Procurar clientes, negócios ou cargas..." className="w-full p-3 focus:outline-none text-gray-700 bg-transparent" />
                <Button type="button" variant="ghost" onClick={() => setSearchOpen(false)} className="text-gray-400">Esc</Button>
             </form>
             <div className="p-4 bg-gray-50 text-xs text-gray-500">Digite para buscar em toda a base de dados. Pressione Enter para buscar.</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* QUICK CREATE MODAL */}
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
            {user.role === 'manager' && <Button variant="secondary" onClick={handleExport} className="hidden sm:flex gap-2"><Download size={16} /> Exportar</Button>}
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
