import { useState, useEffect } from 'react';
import { Expense } from '../models/Expense';
import { getExpenses, saveExpenses } from '../services/ExpenseService';

/**
 * A custom hook for managing expense data.
 * It handles loading, adding, and storing expenses.
 *
 * @returns {{
 *   expenses: Expense[],
 *   loading: boolean,
 *   addExpense: (description: string, amount: number) => Promise<void>,
 *   loadExpenses: () => Promise<void>
 * }} An object containing the expenses, loading state, and functions to manage expenses.
 */
export const useExpenseViewModel = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    const loadedExpenses = await getExpenses();
    setExpenses(loadedExpenses);
    setLoading(false);
  };

  const addExpense = async (description: string, amount: number) => {
    const newExpense: Expense = {
      id: new Date().toISOString(),
      description,
      amount,
      date: new Date().toLocaleDateString(),
    };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  return { expenses, loading, addExpense, loadExpenses };
};
