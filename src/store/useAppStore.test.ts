import { appendExpenses, useAppStore } from './useAppStore';
import { store as storage } from '../services/storage/memoryStorageMock';
import { Expense } from '../models/Expense';

jest.mock('../services/storage/Storage', () => require('../services/storage/memoryStorageMock'));

const saved = (key: string) => JSON.parse(storage.get(key) ?? 'null');
const newExpense = (n: number) => ({
  description: `item ${n}`,
  amount: n,
  date: '2026-10-02T00:00:00.000Z',
  categoryId: 'food',
});

describe('appendExpenses', () => {
  it('adds all 3 items to the existing list with unique ids', () => {
    const existing: Expense = { id: 'a', ...newExpense(0) };
    const result = appendExpenses([existing], [1, 2, 3].map(newExpense));
    expect(result).toHaveLength(4);
    expect(result[0]).toBe(existing);
    expect(new Set(result.map(e => e.id)).size).toBe(4);
  });
});

describe('useAppStore', () => {
  beforeEach(async () => {
    storage.clear();
    useAppStore.setState({ expenses: [], categories: [], incomes: [], loaded: false });
    await useAppStore.getState().load();
  });

  it('loads defaults on first run and records the schema version', () => {
    const state = useAppStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.categories.map(c => c.id)).toContain('other');
    expect(saved('meta')).toEqual({ schemaVersion: 1 });
  });

  it('addExpense updates the store and storage', async () => {
    await useAppStore.getState().addExpense(newExpense(1));
    expect(useAppStore.getState().expenses).toHaveLength(1);
    expect(saved('expenses')).toEqual(useAppStore.getState().expenses);
  });

  it('keeps every expense when several are added without waiting', async () => {
    const { addExpense } = useAppStore.getState();
    await Promise.all([addExpense(newExpense(1)), addExpense(newExpense(2)), addExpense(newExpense(3))]);
    expect(useAppStore.getState().expenses).toHaveLength(3);
    expect(saved('expenses')).toHaveLength(3);
  });

  it('addExpenses saves all items in one go', async () => {
    const count = await useAppStore.getState().addExpenses([1, 2, 3].map(newExpense));
    expect(count).toBe(3);
    expect(saved('expenses')).toHaveLength(3);
  });

  it('updateSettings merges and persists changes', async () => {
    await useAppStore.getState().updateSettings({ currency: 'USD' });
    expect(useAppStore.getState().settings.currency).toBe('USD');
    expect(saved('settings').currency).toBe('USD');
  });
});
