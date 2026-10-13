import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function currencyBRL(cents) {
  if (typeof cents !== 'number' || isNaN(cents)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function compactBRL(cents) {
  if (typeof cents !== 'number' || isNaN(cents)) return '—';
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL', maximumFractionDigits: 1 }).format(cents / 100);
}

export function percent(value) {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

export function dateBR(isoString) {
  if (!isoString) return '—';
  return format(new Date(isoString), 'dd/MM/yyyy', { locale: ptBR });
}

export function dateTimeBR(isoString) {
  if (!isoString) return '—';
  return format(new Date(isoString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

export function relativeDays(isoString) {
  if (!isoString) return '—';
  return formatDistanceToNow(new Date(isoString), { locale: ptBR, addSuffix: true });
}

export function formatDoc(doc) {
  if (!doc) return '—';
  const digits = doc.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (digits.length === 14) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
}

export function stripDoc(doc) {
  return doc ? doc.replace(/\D/g, '') : '';
}

export function getSlaStatus(stageChangedAt, slaDays) {
    if(!stageChangedAt || !slaDays) return 'good';
    const daysInStage = differenceInDays(new Date(), new Date(stageChangedAt));
    if (daysInStage > slaDays) return 'danger';
    if (daysInStage > (slaDays * 0.75)) return 'warning';
    return 'good';
}
