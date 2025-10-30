import * as FileSystem from 'expo-file-system';
import { Expense } from '../models/Expense';

const EXPENSES_FILE = `${FileSystem.documentDirectory}expenses.json`;

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

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    const fileContent = JSON.stringify(expenses, null, 2);
    await FileSystem.writeAsStringAsync(EXPENSES_FILE, fileContent);
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};
