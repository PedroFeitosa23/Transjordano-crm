export function currencyBRL(cents) {
  if (typeof cents !== 'number') return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
export function percent(value) {
  if (typeof value !== 'number') return '—';
  return `${value}%`;
}