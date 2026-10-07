import { Expense } from '../models/Expense';
import { Category } from '../models/Category';
import { hasKey, readJson, writeJson } from './storage/Storage';

const EXPENSES_KEY = 'expenses';
const CATEGORIES_KEY = 'categories';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'fast-food', color: '#FF6347' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#4682B4' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#9370DB' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#20B2AA' },
  { id: 'other', name: 'Other', icon: 'apps', color: '#808080' },
];

/**
 * Retrieves the list of expenses.
 */
export const getExpenses = (): Promise<Expense[]> => readJson<Expense[]>(EXPENSES_KEY, []);

/**
 * Saves the list of expenses.
 */
export const saveExpenses = (expenses: Expense[]): Promise<void> => writeJson(EXPENSES_KEY, expenses);

/**
 * Retrieves the list of categories, saving the defaults on first use.
 */
export const getCategories = async (): Promise<Category[]> => {
  if (!(await hasKey(CATEGORIES_KEY))) {
    await saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return readJson<Category[]>(CATEGORIES_KEY, DEFAULT_CATEGORIES);
};

/**
 * Saves the list of categories.
 */
export const saveCategories = (categories: Category[]): Promise<void> =>
  writeJson(CATEGORIES_KEY, categories);
