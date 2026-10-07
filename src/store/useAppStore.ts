import { create } from 'zustand';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import { Income } from '../models/Income';
import { Settings } from '../models/Settings';
import { getCategories, getExpenses, saveCategories, saveExpenses } from '../services/ExpenseService';
import { getIncomes, saveIncomes, syncAutoIncomes } from '../services/IncomeService';
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '../services/SettingsService';
import { runMigrations } from '../services/storage/migrations';
import { clearAiApiKey, getAiApiKey, setAiApiKey } from '../services/SecretsService';
import { generateId } from '../utils/id';

export type NewExpense = Omit<Expense, 'id'>;

/**
 * Appends new expenses to a list, assigning each one a fresh id.
 */
export const appendExpenses = (
  current: Expense[],
  items: NewExpense[],
  createId: () => string = generateId
): Expense[] => [...current, ...items.map(item => ({ ...item, id: createId() }))];

export interface AppState {
  expenses: Expense[];
  categories: Category[];
  incomes: Income[];
  settings: Settings;
  /** AI provider key, kept in secure storage and never in `settings`. */
  aiApiKey?: string;
  /** True once the first load from storage has finished. */
  loaded: boolean;

  /** Runs migrations and loads everything from storage. Safe to call again to reload. */
  load: () => Promise<void>;

  addExpense: (expense: NewExpense) => Promise<void>;
  /** Adds several expenses in a single write. Returns how many were saved. */
  addExpenses: (items: NewExpense[]) => Promise<number>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addIncome: (income: Omit<Income, 'id' | 'isAutomatic'>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  /** Saves the AI provider key to secure storage (empty removes it). */
  setAiApiKey: (key: string) => Promise<void>;
  clearAiApiKey: () => Promise<void>;

  /** Merges a partial update into the settings and saves them. */
  updateSettings: (changes: Partial<Settings>) => Promise<void>;
}

/**
 * Global app state. Every screen reads the same data, and each action
 * computes from the latest state, updates it synchronously and then persists it.
 */
export const useAppStore = create<AppState>()((set, get) => {
  const commitExpenses = async (expenses: Expense[]) => {
    set({ expenses });
    await saveExpenses(expenses);
  };
  const commitCategories = async (categories: Category[]) => {
    set({ categories });
    await saveCategories(categories);
  };
  const commitIncomes = async (incomes: Income[]) => {
    set({ incomes });
    await saveIncomes(incomes);
  };

  return {
    expenses: [],
    categories: [],
    incomes: [],
    settings: DEFAULT_SETTINGS,
    loaded: false,

    load: async () => {
      try {
        await runMigrations();
      } catch (error) {
        // Keep the app usable; the failed migration runs again on next start.
        console.error('Error running data migrations:', error);
      }
      try {
        const settings = await getSettings();
        await syncAutoIncomes();
        const [expenses, categories, incomes, aiApiKey] = await Promise.all([
          getExpenses(),
          getCategories(),
          getIncomes(),
          getAiApiKey(),
        ]);
        set({ settings, expenses, categories, incomes, aiApiKey });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        set({ loaded: true });
      }
    },

    addExpense: async expense => {
      await commitExpenses(appendExpenses(get().expenses, [expense]));
    },
    addExpenses: async items => {
      if (items.length === 0) return 0;
      await commitExpenses(appendExpenses(get().expenses, items));
      return items.length;
    },
    updateExpense: async expense => {
      await commitExpenses(get().expenses.map(e => (e.id === expense.id ? expense : e)));
    },
    deleteExpense: async id => {
      await commitExpenses(get().expenses.filter(e => e.id !== id));
    },

    addCategory: async category => {
      await commitCategories([...get().categories, { ...category, id: generateId() }]);
    },
    updateCategory: async category => {
      await commitCategories(get().categories.map(c => (c.id === category.id ? category : c)));
    },
    deleteCategory: async id => {
      await commitCategories(get().categories.filter(c => c.id !== id));
    },

    addIncome: async income => {
      await commitIncomes([...get().incomes, { ...income, id: generateId(), isAutomatic: false }]);
    },
    deleteIncome: async id => {
      await commitIncomes(get().incomes.filter(i => i.id !== id));
    },

    setAiApiKey: async key => {
      await setAiApiKey(key);
      set({ aiApiKey: key.trim() || undefined });
    },
    clearAiApiKey: async () => {
      await clearAiApiKey();
      set({ aiApiKey: undefined });
    },

    updateSettings: async changes => {
      const settings = { ...get().settings, ...changes };
      set({ settings });
      await saveSettings(settings);
      if ('baseSalary' in changes || 'payday' in changes) {
        await syncAutoIncomes();
        set({ incomes: await getIncomes() });
      }
    },
  };
});
