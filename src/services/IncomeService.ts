import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Income } from '../models/Income';
import { getSettings } from './SettingsService';

const INCOMES_FILE = 'incomes.json';

let incomesFile: FileSystem.File | null = null;

if (Platform.OS !== 'web') {
  try {
    const { File, Paths } = FileSystem;
    incomesFile = new File(Paths.document, INCOMES_FILE);
  } catch (e) {
    console.warn('Failed to initialize FileSystem for incomes:', e);
  }
}

/**
 * Retrieves all incomes.
 */
export const getIncomes = async (): Promise<Income[]> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem('incomes');
    return data ? JSON.parse(data) : [];
  }

  try {
    if (incomesFile?.exists) {
      const fileContent = await incomesFile.text();
      return JSON.parse(fileContent);
    }
    return [];
  } catch (error) {
    console.error('Error reading incomes:', error);
    return [];
  }
};

/**
 * Saves the incomes array.
 */
export const saveIncomes = async (incomes: Income[]): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem('incomes', JSON.stringify(incomes));
    return;
  }

  try {
    if (incomesFile) {
      incomesFile.write(JSON.stringify(incomes, null, 2));
    }
  } catch (error) {
    console.error('Error saving incomes:', error);
  }
};

/**
 * Automatically creates an income entry for the base salary if payday has arrived
 * and the entry for the current cycle hasn't been created yet.
 * We consider the current calendar month.
 */
export const syncAutoIncomes = async (): Promise<void> => {
  const settings = await getSettings();
  if (!settings.baseSalary || !settings.payday) return;

  const today = new Date();
  
  // Only add if today is >= payday (meaning we reached payday for this month)
  if (today.getDate() < settings.payday) return;

  const incomes = await getIncomes();
  
  // Check if an auto-income for this month already exists
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const hasAutoIncomeThisMonth = incomes.some(inc => {
    if (!inc.isAutomatic) return false;
    const d = new Date(inc.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  if (!hasAutoIncomeThisMonth) {
    // Generate new automated income using payday for the current month
    const autoIncomeDate = new Date(currentYear, currentMonth, settings.payday).toISOString();
    
    const newIncome: Income = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'Salário Base',
      amount: settings.baseSalary,
      date: autoIncomeDate,
      isAutomatic: true
    };
    
    incomes.push(newIncome);
    await saveIncomes(incomes);
  }
};
