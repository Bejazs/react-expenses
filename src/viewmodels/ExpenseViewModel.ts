import { useState, useEffect } from 'react';
import { Expense } from '../models/Expense';
import { getExpenses, saveExpenses } from '../services/ExpenseService';

/**
 * A custom hook for managing expense data.
 * It handles loading, adding, updating, deleting, and storing expenses.
 *
 * @returns {{
 *   expenses: Expense[],
 *   loading: boolean,
 *   addExpense: (description: string, amount: number, date: string, categoryId: string) => Promise<void>,
 *   deleteExpense: (id: string) => Promise<void>,
 *   updateExpense: (updatedExpense: Expense) => Promise<void>,
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

  const addExpense = async (description: string, amount: number, date: string, categoryId: string) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount,
      date,
      categoryId,
    };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const updateExpense = async (updatedExpense: Expense) => {
    const updatedExpenses = expenses.map((e) =>
      e.id === updatedExpense.id ? updatedExpense : e
    );
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  return { expenses, loading, addExpense, deleteExpense, updateExpense, loadExpenses };
};
