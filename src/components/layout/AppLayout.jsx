import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { ShieldCheck, ChevronDown, Search, Download, Plus, Menu, LogOut, X } from 'lucide-react';
import { NAV_ITEMS } from '@/app/nav.config';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentTitle = NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Sistema';

  if (!user) return <Navigate to="/login" replace />;

  const NavLinks = ({ onClick }) => (
    <>
      <p className="text-xs text-transjordano-blue-200 font-semibold mb-4 tracking-wider uppercase px-4">Menu Principal</p>
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.id} to={item.path} onClick={onClick} className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-l-4 ${isActive ? 'bg-white/10 border-transjordano-green-500 text-white' : 'border-transparent text-transjordano-blue-200 hover:bg-white/5 hover:text-white'}`}>
          <item.icon size={20} />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex h-dvh bg-gray-50 font-sans overflow-hidden">
      <aside className="w-64 bg-transjordano-blue-900 text-white flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          <div className="p-6 flex items-center justify-center border-b border-gray-700/50"><Logo /></div>
          <nav className="p-4 space-y-1"><NavLinks /></nav>
        </div>
        <div className="p-4 border-t border-gray-700/50">
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

      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in" />
          <Dialog.Content className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-transjordano-blue-900 text-white shadow-xl z-50 flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left">
            <div className="p-4 flex items-center justify-between border-b border-gray-700/50">
              <Logo className="text-xl" />
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white"><X size={24}/></button>
            </div>
            <nav className="p-4 flex-1 overflow-y-auto space-y-1"><NavLinks onClick={() => setMobileOpen(false)} /></nav>
            <div className="p-4 border-t border-gray-700/50"><Button variant="danger" className="w-full" onClick={logout}>Sair</Button></div>
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
              <input type="text" placeholder="Busca global..." onClick={() => toast.info('Busca global conectada no módulo P2')} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-transjordano-green-500 focus:ring-1 focus:ring-transjordano-green-500 text-sm w-48 lg:w-64 cursor-pointer" readOnly />
            </div>
            {user.role === 'manager' && <Button variant="secondary" onClick={() => toast.info('Exportação gerando CSV (Módulo P1)')} className="hidden sm:flex gap-2"><Download size={16} /> Exportar</Button>}
            <Button onClick={() => toast.info('Criação rápida em breve')} className="gap-2"><Plus size={16} /> Nova</Button>
          </div>
        </header>

        <main id="conteudo" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto w-full flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
