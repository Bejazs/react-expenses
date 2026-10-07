import { generateId } from './id';

describe('generateId', () => {
  it('does not repeat in 1000 calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });

  it('does not repeat without crypto.randomUUID', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    try {
      const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
      expect(ids.size).toBe(1000);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true });
    }
  });
});
