let counter = 0;

/**
 * Generates a unique identifier for stored entities (expenses, incomes, categories).
 * Uses `crypto.randomUUID` when the runtime provides it; otherwise combines the
 * timestamp, a per-session counter and random characters so that ids created in
 * the same millisecond never collide.
 */
export const generateId = (): string => {
  const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${counter.toString(36)}-${random}`;
};
