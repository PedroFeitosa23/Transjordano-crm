import { LayoutDashboard, Briefcase, Users, BrainCircuit, Wand2, TrendingUp } from 'lucide-react';
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard & BI', path: '/', icon: LayoutDashboard, roles: ['manager', 'sales'] },
  { id: 'funil', label: 'Funil de Vendas', path: '/funil', icon: Briefcase, roles: ['manager', 'sales'] },
  { id: 'leads', label: 'Leads & Contatos', path: '/leads', icon: Users, roles: ['manager', 'sales'] },
  
  // Módulos IA
  { id: 'copilot', label: 'Copiloto IA', path: '/ia/copiloto', icon: BrainCircuit, roles: ['manager', 'sales'], isAi: true },
  { id: 'forecast', label: 'Previsões (AI)', path: '/ia/previsoes', icon: TrendingUp, roles: ['manager'], isAi: true },
  { id: 'gerador', label: 'Estúdio de Propostas', path: '/ia/propostas', icon: Wand2, roles: ['manager', 'sales'], isAi: true },
];
