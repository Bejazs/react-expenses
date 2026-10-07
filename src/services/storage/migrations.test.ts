import { Migration, META_KEY, runMigrations, LATEST_SCHEMA_VERSION } from './migrations';
import { store } from './memoryStorageMock';

jest.mock('./Storage', () => require('./memoryStorageMock'));

describe('runMigrations', () => {
  beforeEach(() => store.clear());

  it('applies each migration once, in order, and saves the schema version', async () => {
    const calls: number[] = [];
    const migrations: Migration[] = [
      { version: 2, description: 'b', migrate: async () => { calls.push(2); } },
      { version: 1, description: 'a', migrate: async () => { calls.push(1); } },
    ];

    expect(await runMigrations(migrations)).toEqual([1, 2]);
    expect(await runMigrations(migrations)).toEqual([]);
    expect(calls).toEqual([1, 2]);
    expect(JSON.parse(store.get(META_KEY)!)).toEqual({ schemaVersion: 2 });
  });

  it('only runs migrations newer than the stored version', async () => {
    store.set(META_KEY, JSON.stringify({ schemaVersion: 1 }));
    const migrate = jest.fn(async () => {});
    await runMigrations([
      { version: 1, description: 'a', migrate },
      { version: 2, description: 'b', migrate },
    ]);
    expect(migrate).toHaveBeenCalledTimes(1);
  });

  it('brings existing data up to the latest schema without touching it', async () => {
    const expenses = [{ id: 'x', description: 'Café', amount: 1.2, date: '2026-10-01T00:00:00.000Z', categoryId: 'food' }];
    store.set('expenses', JSON.stringify(expenses));
    await runMigrations();
    expect(JSON.parse(store.get(META_KEY)!)).toEqual({ schemaVersion: LATEST_SCHEMA_VERSION });
    expect(JSON.parse(store.get('expenses')!)).toEqual(expenses);
  });
});
