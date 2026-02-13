const dateCache = new Map<string, string>();

/**
 * Formats an ISO date string into a local date string.
 * Uses a cache to avoid repeated Date object creation and slow toLocaleDateString calls.
 *
 * @param dateISO The ISO 8601 date string to format.
 * @returns The formatted date string or 'Invalid Date' if formatting fails.
 */
export const formatDate = (dateISO: string): string => {
  if (!dateISO) return 'Invalid Date';

  const cached = dateCache.get(dateISO);
  if (cached) return cached;

  try {
    const date = new Date(dateISO);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const formatted = date.toLocaleDateString();
    dateCache.set(dateISO, formatted);
    return formatted;
  } catch (e) {
    return 'Invalid Date';
  }
};
