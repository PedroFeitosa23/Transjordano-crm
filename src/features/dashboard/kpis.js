export function calcValorTotalFunil(opportunities) { return opportunities.filter(o => o.status === 'open').reduce((acc, o) => acc + (o.valueCents || 0), 0); }
export function calcForecast(opportunities, stages) {
  return Math.round(opportunities.filter(o => o.status === 'open').reduce((acc, o) => {
    const stage = stages.find(s => s.id === o.stageId);
    const prob = o.probabilityOverride != null ? o.probabilityOverride : (stage ? stage.probability : 0);
    return acc + (o.valueCents || 0) * (prob / 100);
  }, 0));
}
export function calcNegociosGanhos(opportunities) { return opportunities.filter(o => o.status === 'won').reduce((acc, o) => acc + (o.valueCents || 0), 0); }
export function calcTaxaConversao(opportunities) {
  const won = opportunities.filter(o => o.status === 'won').length;
  const lost = opportunities.filter(o => o.status === 'lost').length;
  if (won + lost === 0) return null;
  return (won / (won + lost)) * 100;
}