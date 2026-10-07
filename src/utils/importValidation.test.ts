import { Category } from '../models/Category';
import { validateImportedExpenses } from './importValidation';

const categories: Category[] = [
  { id: 'food', name: 'Food', icon: 'fast-food', color: '#FF6347' },
  { id: 'other', name: 'Other', icon: 'apps', color: '#808080' },
];

describe('validateImportedExpenses', () => {
  it('keeps valid items and normalizes the date', () => {
    const { valid, skipped } = validateImportedExpenses(
      [{ description: 'Pingo Doce', amount: 12.5, date: '2026-10-01', categoryId: 'food' }],
      categories
    );
    expect(skipped).toBe(0);
    expect(valid).toEqual([
      { description: 'Pingo Doce', amount: 12.5, date: new Date('2026-10-01').toISOString(), categoryId: 'food' },
    ]);
  });

  it('rejects invalid amounts and dates', () => {
    const { valid, skipped } = validateImportedExpenses(
      [
        { description: 'zero', amount: 0, date: '2026-10-01', categoryId: 'food' },
        { description: 'negative', amount: -5, date: '2026-10-01', categoryId: 'food' },
        { description: 'nan', amount: 'abc', date: '2026-10-01', categoryId: 'food' },
        { description: 'bad date', amount: 5, date: 'not a date', categoryId: 'food' },
        { description: 'no date', amount: 5, categoryId: 'food' },
        null,
        'text',
        { description: 'ok', amount: '7.20', date: '2026-10-02', categoryId: 'food' },
      ],
      categories
    );
    expect(skipped).toBe(7);
    expect(valid).toHaveLength(1);
    expect(valid[0].amount).toBe(7.2);
  });

  it('maps unknown categories to "other"', () => {
    const { valid } = validateImportedExpenses(
      [{ description: 'x', amount: 1, date: '2026-10-01', categoryId: 'does-not-exist' }],
      categories
    );
    expect(valid[0].categoryId).toBe('other');
  });

  it('returns nothing for a non-array response', () => {
    expect(validateImportedExpenses({ foo: 1 }, categories)).toEqual({ valid: [], skipped: 0 });
  });
});
