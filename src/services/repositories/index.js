import { MOCK_DB } from '../adapters/mock/seed';
const delay = (ms) => new Promise(res => setTimeout(res, ms));
const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);

class MockRepo {
  constructor(collection) { this.collection = collection; }
  
  async list(filters = {}) {
    await delay(100);
    let data = Array.isArray(MOCK_DB[this.collection]) ? [...MOCK_DB[this.collection]] : Object.values(MOCK_DB[this.collection]);
    if (filters.ownerId) data = data.filter(i => i.ownerId === filters.ownerId);
    if (filters.status) data = data.filter(i => i.status === filters.status);
    if (filters.opportunityId) data = data.filter(i => i.opportunityId === filters.opportunityId);
    return data;
  }
  
  async get(id) {
    await delay(50);
    const item = (Array.isArray(MOCK_DB[this.collection]) ? MOCK_DB[this.collection] : Object.values(MOCK_DB[this.collection])).find(i => i.id === id);
    if (!item) throw new Error('Not found');
    return item;
  }
  
  async create(data) {
    await delay(150);
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if(Array.isArray(MOCK_DB[this.collection])) MOCK_DB[this.collection].push(newItem);
    else MOCK_DB[this.collection][newItem.id] = newItem;
    return newItem;
  }
  
  async update(id, patch, userId = 'system') {
    await delay(150);
    const list = Array.isArray(MOCK_DB[this.collection]) ? MOCK_DB[this.collection] : Object.values(MOCK_DB[this.collection]);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Not found');
    
    const oldItem = list[idx];
    const updated = { ...oldItem, ...patch, updatedAt: new Date().toISOString() };
    
    if (this.collection === 'opportunities' && patch.stageId && patch.stageId !== oldItem.stageId) {
       MOCK_DB.stageHistory.push({
         id: generateId(), opportunityId: id, fromStageId: oldItem.stageId, toStageId: patch.stageId, changedBy: userId, changedAt: new Date().toISOString()
       });
    }

    if(Array.isArray(MOCK_DB[this.collection])) MOCK_DB[this.collection][idx] = updated;
    else MOCK_DB[this.collection][id] = updated;
    return updated;
  }
  
  async delete(id) {
    await delay(150);
    if(Array.isArray(MOCK_DB[this.collection])) {
      const idx = MOCK_DB[this.collection].findIndex(i => i.id === id);
      if(idx > -1) MOCK_DB[this.collection].splice(idx, 1);
    }
  }
}
export const opportunitiesRepo = new MockRepo('opportunities');
export const contactsRepo = new MockRepo('contacts');
export const leadsRepo = new MockRepo('leads');
export const stagesRepo = new MockRepo('stages');
export const stageHistoryRepo = new MockRepo('stageHistory');
export const activitiesRepo = new MockRepo('activities');
export const quotasRepo = new MockRepo('quotas');
