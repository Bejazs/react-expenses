import { Platform } from 'react-native';
import { Expense } from '../models/Expense';
import { Category } from '../models/Category';
import * as FileSystem from 'expo-file-system';

// Use Paths.document for v19+ of expo-file-system
const EXPENSES_FILE = 'expenses.json';
const CATEGORIES_FILE = 'categories.json';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'fast-food', color: '#FF6347' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#4682B4' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#9370DB' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#20B2AA' },
  { id: 'other', name: 'Other', icon: 'apps', color: '#808080' },
];

let expensesFile: FileSystem.File | null = null;
let categoriesFile: FileSystem.File | null = null;

if (Platform.OS !== 'web') {
  try {
    const { File, Paths } = FileSystem;
    expensesFile = new File(Paths.document, EXPENSES_FILE);
    categoriesFile = new File(Paths.document, CATEGORIES_FILE);
  } catch (e) {
    console.warn("Failed to initialize FileSystem:", e);
  }
}

/**
 * Retrieves the list of expenses.
 * Uses localStorage on Web and FileSystem on Native.
 * @returns {Promise<Expense[]>}
 */
export const getExpenses = async (): Promise<Expense[]> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem('expenses');
    return data ? JSON.parse(data) : [];
  }

  try {
    if (expensesFile?.exists) {
      const fileContent = await expensesFile.text();
      return JSON.parse(fileContent);
    }
    return [];
  } catch (error) {
    console.error('Error reading expenses:', error);
    return [];
  }
};

/**
 * Saves the list of expenses.
 * Uses localStorage on Web and FileSystem on Native.
 * @param {Expense[]} expenses - The list of expenses to save.
 */
export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    return;
  }

  try {
    if (expensesFile) {
        expensesFile.write(JSON.stringify(expenses, null, 2));
    }
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};

/**
 * Retrieves the list of categories.
 * Uses localStorage on Web and FileSystem on Native.
 * @returns {Promise<Category[]>}
 */
export const getCategories = async (): Promise<Category[]> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem('categories');
    if (data) {
        return JSON.parse(data);
    } else {
        await saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
    }
  }

  try {
    if (categoriesFile?.exists) {
      const content = await categoriesFile.text();
      return JSON.parse(content);
    } else {
      await saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
  } catch (error) {
    console.error('Error reading categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

/**
 * Saves the list of categories.
 * Uses localStorage on Web and FileSystem on Native.
 * @param {Category[]} categories - The list of categories to save.
 */
export const saveCategories = async (categories: Category[]): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem('categories', JSON.stringify(categories));
    return;
  }

  try {
    if (categoriesFile) {
        categoriesFile.write(JSON.stringify(categories, null, 2));
    }
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};
