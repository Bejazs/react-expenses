import { useAppStore } from '../store/useAppStore';

/**
 * Income data and actions, read from the global store.
 */
export const useIncomeViewModel = () => {
  const incomes = useAppStore(s => s.incomes);
  const loaded = useAppStore(s => s.loaded);
  const load = useAppStore(s => s.load);
  const add = useAppStore(s => s.addIncome);
  const deleteIncome = useAppStore(s => s.deleteIncome);

  /**
   * Adds a manual income.
   */
  const addIncome = (description: string, amount: number, date: string) => add({ description, amount, date });

  return { incomes, loading: !loaded, loadIncomes: load, addIncome, deleteIncome };
};
