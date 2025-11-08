import * as FileSystem from 'expo-file-system';
import { Expense } from '../models/Expense';

const EXPENSES_FILE = `${FileSystem.documentDirectory}expenses.json`;

/**
 * Retrieves the list of expenses from the file system.
 * @returns {Promise<Expense[]>} A promise that resolves to an array of expenses. If the file does not exist or an error occurs, it returns an empty array.
 */
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(EXPENSES_FILE);
    if (fileInfo.exists) {
      const fileContent = await FileSystem.readAsStringAsync(EXPENSES_FILE);
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
    await FileSystem.writeAsStringAsync(EXPENSES_FILE, fileContent);
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};
