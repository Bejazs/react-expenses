import { File, Paths } from 'expo-file-system';
import { Expense } from '../models/Expense';
import { Category } from '../models/Category';

// Create File instances
const expensesFile = new File(Paths.document, 'expenses.json');
const categoriesFile = new File(Paths.document, 'categories.json');

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'fast-food', color: '#FF6347' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#4682B4' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#9370DB' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#20B2AA' },
  { id: 'other', name: 'Other', icon: 'apps', color: '#808080' },
];

/**
 * Retrieves the list of expenses from the file system.
 * @returns {Promise<Expense[]>} A promise that resolves to an array of expenses. If the file does not exist or an error occurs, it returns an empty array.
 */
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    if (expensesFile.exists) {
      const fileContent = await expensesFile.text();
      return JSON.parse(fileContent);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error reading expenses:', error);
    return [];
  }
};

/**
 * Saves the list of expenses to the file system.
 * @param {Expense[]} expenses - The array of expenses to save.
 * @returns {Promise<void>} A promise that resolves when the expenses have been saved.
 */
export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    const fileContent = JSON.stringify(expenses, null, 2);
    expensesFile.write(fileContent);
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};

/**
 * Retrieves the list of categories. Seeds default categories if none exist.
 * @returns {Promise<Category[]>}
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    if (categoriesFile.exists) {
      const content = await categoriesFile.text();
      const categories = JSON.parse(content);
      // If parsing fails or returns something unexpected, we might want to recover.
      // But assuming valid JSON array.
      return categories;
    } else {
      // Initialize with default categories
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
 * @param {Category[]} categories
 */
export const saveCategories = async (categories: Category[]): Promise<void> => {
  try {
    const content = JSON.stringify(categories, null, 2);
    categoriesFile.write(content);
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};
