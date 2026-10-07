import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import { safeParseDate } from './dateUtils';

export const FALLBACK_CATEGORY_ID = 'other';

export interface ImportValidationResult {
  /** Items ready to be saved. */
  valid: Omit<Expense, 'id'>[];
  /** Number of items rejected because they were malformed. */
  skipped: number;
}

/**
 * Validates the expenses returned by the AI before they are saved.
 * - `amount` must be a finite number greater than zero (numeric strings are accepted).
 * - `date` must be parseable; it is normalized to an ISO string.
 * - `categoryId` must exist; otherwise the expense goes to "other".
 * Invalid items are dropped and counted in `skipped`.
 */
export const validateImportedExpenses = (
  items: unknown,
  categories: Category[]
): ImportValidationResult => {
  if (!Array.isArray(items)) {
    return { valid: [], skipped: 0 };
  }

  const categoryIds = new Set(categories.map(c => c.id));
  const fallbackCategoryId = categoryIds.has(FALLBACK_CATEGORY_ID)
    ? FALLBACK_CATEGORY_ID
    : categories[0]?.id ?? FALLBACK_CATEGORY_ID;

  const valid: Omit<Expense, 'id'>[] = [];
  let skipped = 0;

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      skipped++;
      continue;
    }
    const raw = item as Record<string, unknown>;

    const amount = typeof raw.amount === 'string' ? Number(raw.amount) : raw.amount;
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      skipped++;
      continue;
    }

    const date =
      typeof raw.date === 'string' || typeof raw.date === 'number' ? safeParseDate(raw.date) : null;
    if (!date) {
      skipped++;
      continue;
    }

    const description =
      typeof raw.description === 'string' && raw.description.trim() ? raw.description.trim() : '';
    const categoryId =
      typeof raw.categoryId === 'string' && categoryIds.has(raw.categoryId)
        ? raw.categoryId
        : fallbackCategoryId;

    valid.push({ description, amount, date: date.toISOString(), categoryId });
  }

  return { valid, skipped };
};
