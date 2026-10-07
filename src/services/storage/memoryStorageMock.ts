/**
 * In-memory replacement for ./Storage, for tests:
 * jest.mock('<path>/services/storage/Storage', () => require('<path>/services/storage/memoryStorageMock'));
 */
export const store = new Map<string, string>();

export const readJson = async <T>(key: string, fallback: T): Promise<T> =>
  store.has(key) ? (JSON.parse(store.get(key) as string) as T) : fallback;

export const hasKey = async (key: string): Promise<boolean> => store.has(key);

export const writeJson = async <T>(key: string, value: T): Promise<void> => {
  store.set(key, JSON.stringify(value));
};
