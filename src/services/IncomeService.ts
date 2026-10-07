import { Income } from '../models/Income';
import { generateId } from '../utils/id';
import { getSettings } from './SettingsService';
import { readJson, writeJson } from './storage/Storage';

const INCOMES_KEY = 'incomes';

/**
 * Retrieves all incomes.
 */
export const getIncomes = (): Promise<Income[]> => readJson<Income[]>(INCOMES_KEY, []);

/**
 * Saves the incomes array.
 */
export const saveIncomes = (incomes: Income[]): Promise<void> => writeJson(INCOMES_KEY, incomes);

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
      id: generateId(),
      description: 'Salário Base',
      amount: settings.baseSalary,
      date: autoIncomeDate,
      isAutomatic: true
    };
    
    incomes.push(newIncome);
    await saveIncomes(incomes);
  }
};
