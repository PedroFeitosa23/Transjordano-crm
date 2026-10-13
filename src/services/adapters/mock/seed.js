export const MOCK_USERS = {
  'u1': { uid: 'u1', name: 'Admin Silva', email: 'admin@transjordano.com.br', role: 'manager', active: true },
  'u2': { uid: 'u2', name: 'Vendedor Souza', email: 'vendas@transjordano.com.br', role: 'sales', active: true }
};

export const MOCK_STAGES = [
  { id: 's1', name: 'Prospecção', order: 1, probability: 10, kind: 'open' },
  { id: 's2', name: 'Qualificação', order: 2, probability: 25, kind: 'open' },
  { id: 's3', name: 'Proposta', order: 3, probability: 50, kind: 'open' },
  { id: 's4', name: 'Negociação', order: 4, probability: 75, kind: 'open' },
  { id: 's5', name: 'Ganho', order: 5, probability: 100, kind: 'won' },
  { id: 's6', name: 'Perdido', order: 6, probability: 0, kind: 'lost' }
];

export const MOCK_CONTACTS = [
  { id: 'c1', type: 'company', name: 'Agro Logística SA', document: '12345678000199', email: 'contato@agrolog.com.br', phone: '5519999999999', address: null, source: 'Site', tags: ['vip'], ownerId: 'u1', consent: { granted: true, at: new Date().toISOString(), channel: 'web' }, searchKeywords: ['agro', 'logistica'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
  { id: 'c2', type: 'person', name: 'João Santos', document: '11122233344', email: 'joao@email.com', phone: '5511988887777', address: null, source: 'Indicação', tags: [], ownerId: 'u2', consent: { granted: false, at: null, channel: null }, searchKeywords: ['joao', 'santos'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null }
];

export const MOCK_OPPORTUNITIES = [
  { id: 'o1', title: 'Transporte Safra 2026', contactId: 'c1', ownerId: 'u1', stageId: 's3', status: 'open', valueCents: 15000000, expectedCloseDate: '2026-11-01T00:00:00Z', probabilityOverride: null, lostReason: null, closedAt: null, position: 1000, stageChangedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'o2', title: 'Distribuição SP', contactId: 'c2', ownerId: 'u2', stageId: 's5', status: 'won', valueCents: 5000000, expectedCloseDate: '2026-10-01T00:00:00Z', probabilityOverride: null, lostReason: null, closedAt: '2026-10-10T00:00:00Z', position: 1000, stageChangedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'o3', title: 'Renovação Frota', contactId: 'c1', ownerId: 'u2', stageId: 's2', status: 'open', valueCents: 8500000, expectedCloseDate: '2026-12-15T00:00:00Z', probabilityOverride: 30, lostReason: null, closedAt: null, position: 2000, stageChangedAt: new Date(Date.now() - 15*24*60*60*1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

export const MOCK_DB = {
  users: MOCK_USERS,
  stages: MOCK_STAGES,
  contacts: MOCK_CONTACTS,
  opportunities: MOCK_OPPORTUNITIES,
  activities: []
};
