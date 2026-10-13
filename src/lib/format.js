import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function currencyBRL(cents) {
  if (typeof cents !== 'number') return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function compactBRL(cents) {
  if (typeof cents !== 'number') return '—';
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL', maximumFractionDigits: 1 }).format(cents / 100);
}

export function percent(value) {
  if (typeof value !== 'number') return '—';
  return `${Math.round(value)}%`;
}

export function dateBR(isoString) {
  if (!isoString) return '—';
  return format(new Date(isoString), 'dd/MM/yyyy', { locale: ptBR });
}

export function relativeDays(isoString) {
  if (!isoString) return '—';
  return formatDistanceToNow(new Date(isoString), { locale: ptBR, addSuffix: true });
}
