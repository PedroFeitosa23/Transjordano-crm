import { LayoutDashboard, Briefcase, Users } from 'lucide-react';
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard & BI', path: '/', icon: LayoutDashboard, roles: ['manager', 'sales'] },
  { id: 'funil', label: 'Funil de Vendas', path: '/funil', icon: Briefcase, roles: ['manager', 'sales'] },
  { id: 'leads', label: 'Leads & Contatos', path: '/leads', icon: Users, roles: ['manager', 'sales'] },
];