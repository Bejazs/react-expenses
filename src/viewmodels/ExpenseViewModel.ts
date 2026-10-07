import { useAppStore } from '../store/useAppStore';

/**
 * Expense data and actions, read from the global store.
 */
export const useExpenseViewModel = () => {
  const expenses = useAppStore(s => s.expenses);
  const loaded = useAppStore(s => s.loaded);
  const load = useAppStore(s => s.load);
  const add = useAppStore(s => s.addExpense);
  const addExpenses = useAppStore(s => s.addExpenses);
  const deleteExpense = useAppStore(s => s.deleteExpense);
  const updateExpense = useAppStore(s => s.updateExpense);

  /**
   * Adds a new expense.
   */
  const addExpense = (description: string, amount: number, date: string, categoryId: string) =>
    add({ description, amount, date, categoryId });

  return { expenses, loading: !loaded, addExpense, addExpenses, deleteExpense, updateExpense, loadExpenses: load };
};
