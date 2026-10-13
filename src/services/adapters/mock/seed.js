export const MOCK_USERS = { 'u1': { uid: 'u1', name: 'Admin Silva', email: 'admin@transjordano.com.br', role: 'manager', active: true }, 'u2': { uid: 'u2', name: 'Vendedor Souza', email: 'vendas@transjordano.com.br', role: 'sales', active: true } };
export const MOCK_STAGES = [
  { id: 's1', name: 'Prospecção', order: 1, probability: 10, kind: 'open', slaDays: 3 },
  { id: 's2', name: 'Qualificação', order: 2, probability: 25, kind: 'open', slaDays: 5 },
  { id: 's3', name: 'Proposta', order: 3, probability: 50, kind: 'open', slaDays: 7 },
  { id: 's4', name: 'Negociação', order: 4, probability: 75, kind: 'open', slaDays: 10 },
  { id: 's5', name: 'Ganho', order: 5, probability: 100, kind: 'won', slaDays: 0 },
  { id: 's6', name: 'Perdido', order: 6, probability: 0, kind: 'lost', slaDays: 0 }
];
export const MOCK_CONTACTS = [
  { id: 'c1', type: 'company', name: 'Agro Logística SA', document: '12345678000199', email: 'contato@agrolog.com.br', phone: '5519999999999', address: 'Campinas, SP', source: 'Site', tags: ['vip'], ownerId: 'u1', consent: { granted: true, at: new Date().toISOString(), channel: 'web' } },
  { id: 'c2', type: 'person', name: 'João Santos', document: '11122233344', email: 'joao@email.com', phone: '5511988887777', address: 'São Paulo, SP', source: 'Indicação', tags: [], ownerId: 'u2', consent: { granted: false, at: null, channel: null } }
];
export const MOCK_LEADS = [
  { id: 'l1', name: 'Indústria Química Beta', contact: 'Maria (Compras)', phone: '551988881111', email: 'compras@beta.com.br', source: 'Feira', score: 85, status: 'new', ownerId: 'u2', createdAt: new Date().toISOString() },
  { id: 'l2', name: 'Distribuidora Alimentos XYZ', contact: 'Carlos', phone: '551199992222', email: 'carlos@xyz.com.br', source: 'Inbound', score: 40, status: 'contacted', ownerId: 'u1', createdAt: new Date().toISOString() }
];
// FASE 3: Campos logísticos e de previsão
export const MOCK_OPPORTUNITIES = [
  { id: 'o1', title: 'Transporte Safra 2026', contactId: 'c1', ownerId: 'u1', stageId: 's3', status: 'open', valueCents: 15000000, priority: 'high', origin: 'Mato Grosso', destination: 'Porto de Santos', cargoType: 'Soja a granel', volumeTonsMonth: 5000, expectedCloseDate: '2026-11-01T00:00:00Z', nextActivityAt: '2026-10-15T14:00:00Z', probabilityOverride: null, lostReason: null, closedAt: null, position: 1000, stageChangedAt: new Date(Date.now() - 6*24*60*60*1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'o2', title: 'Distribuição SP Capital', contactId: 'c2', ownerId: 'u2', stageId: 's5', status: 'won', valueCents: 5000000, priority: 'medium', origin: 'Campinas, SP', destination: 'São Paulo, SP', cargoType: 'Manufaturados', volumeTonsMonth: 800, expectedCloseDate: '2026-10-01T00:00:00Z', nextActivityAt: null, probabilityOverride: null, lostReason: null, closedAt: '2026-10-10T00:00:00Z', position: 1000, stageChangedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'o3', title: 'Renovação Frota Dedicada', contactId: 'c1', ownerId: 'u2', stageId: 's2', status: 'open', valueCents: 8500000, priority: 'high', origin: 'Paulínia, SP', destination: 'Nacional', cargoType: 'Combustíveis', volumeTonsMonth: 12000, expectedCloseDate: '2026-12-15T00:00:00Z', nextActivityAt: '2026-10-12T10:00:00Z', probabilityOverride: 30, lostReason: null, closedAt: null, position: 2000, stageChangedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];
export const MOCK_ACTIVITIES = [
  { id: 'a1', opportunityId: 'o1', type: 'meeting', summary: 'Reunião inicial de escopo de transporte', ownerId: 'u1', doneAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
  { id: 'a2', opportunityId: 'o1', type: 'email', summary: 'Envio da tabela de frete preliminar', ownerId: 'u1', doneAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  { id: 'a3', opportunityId: 'o3', type: 'call', summary: 'Ligação de alinhamento com diretoria', ownerId: 'u2', doneAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() }
];
export const MOCK_QUOTAS = {
  'u1': { targetCents: 30000000, period: '2026-Q4' },
  'u2': { targetCents: 20000000, period: '2026-Q4' }
};
export const MOCK_DB = { users: MOCK_USERS, stages: MOCK_STAGES, contacts: MOCK_CONTACTS, leads: MOCK_LEADS, opportunities: MOCK_OPPORTUNITIES, stageHistory: [], activities: MOCK_ACTIVITIES, quotas: MOCK_QUOTAS };
