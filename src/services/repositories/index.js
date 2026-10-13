import { MOCK_DB } from '../adapters/mock/seed';

// Mock repository implementation (Synchronous with fake delay)
const delay = (ms) => new Promise(res => setTimeout(res, ms));

class MockRepo {
  constructor(collection) { this.collection = collection; }
  
  async list(filters = {}) {
    await delay(200);
    let data = Array.isArray(MOCK_DB[this.collection]) ? [...MOCK_DB[this.collection]] : Object.values(MOCK_DB[this.collection]);
    
    // Basic filtering mock
    if (filters.ownerId) data = data.filter(i => i.ownerId === filters.ownerId);
    if (filters.status) data = data.filter(i => i.status === filters.status);
    
    return data;
  }
  
  async get(id) {
    await delay(100);
    const item = (Array.isArray(MOCK_DB[this.collection]) ? MOCK_DB[this.collection] : Object.values(MOCK_DB[this.collection])).find(i => i.id === id);
    if (!item) throw new Error('Not found');
    return item;
  }
  
  async create(data) {
    await delay(300);
    const newItem = { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if(Array.isArray(MOCK_DB[this.collection])) MOCK_DB[this.collection].push(newItem);
    else MOCK_DB[this.collection][newItem.id] = newItem;
    return newItem;
  }
  
  async update(id, patch) {
    await delay(300);
    const list = Array.isArray(MOCK_DB[this.collection]) ? MOCK_DB[this.collection] : Object.values(MOCK_DB[this.collection]);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Not found');
    const updated = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    if(Array.isArray(MOCK_DB[this.collection])) MOCK_DB[this.collection][idx] = updated;
    else MOCK_DB[this.collection][id] = updated;
    return updated;
  }
}

export const opportunitiesRepo = new MockRepo('opportunities');
export const contactsRepo = new MockRepo('contacts');
export const stagesRepo = new MockRepo('stages');
export const activitiesRepo = new MockRepo('activities');
export const usersRepo = new MockRepo('users');
