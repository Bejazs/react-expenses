import { appendExpenses } from './ExpenseViewModel';
import { Expense } from '../models/Expense';

jest.mock('../services/ExpenseService', () => ({
  getExpenses: jest.fn(async () => []),
  saveExpenses: jest.fn(async () => undefined),
}));

const existing: Expense = { id: 'a', description: 'Old', amount: 1, date: '2026-10-01T00:00:00.000Z', categoryId: 'food' };

describe('appendExpenses', () => {
  it('adds all 3 items to the existing list', () => {
    const items = [1, 2, 3].map(n => ({ description: `item ${n}`, amount: n, date: '2026-10-02T00:00:00.000Z', categoryId: 'food' }));
    const result = appendExpenses([existing], items);
    expect(result).toHaveLength(4);
    expect(result[0]).toBe(existing);
    expect(result.slice(1).map(e => e.description)).toEqual(['item 1', 'item 2', 'item 3']);
    expect(new Set(result.map(e => e.id)).size).toBe(4);
  });
});
