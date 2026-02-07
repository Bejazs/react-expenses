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

  /**
   * Loads expenses from the persistence layer (file system or local storage).
   */
  const loadExpenses = async () => {
    setLoading(true);
    const loadedExpenses = await getExpenses();
    setExpenses(loadedExpenses);
    setLoading(false);
  };

  /**
   * Adds a new expense.
   *
   * @param {string} description - A description of the expense.
   * @param {number} amount - The amount of the expense.
   * @param {string} date - The date of the expense (ISO string).
   * @param {string} categoryId - The ID of the category the expense belongs to.
   */
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

  /**
   * Deletes an expense by its ID.
   *
   * @param {string} id - The ID of the expense to delete.
   */
  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  /**
   * Updates an existing expense.
   *
   * @param {Expense} updatedExpense - The expense object with updated properties.
   */
  const updateExpense = async (updatedExpense: Expense) => {
    const updatedExpenses = expenses.map((e) =>
      e.id === updatedExpense.id ? updatedExpense : e
    );
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  return { expenses, loading, addExpense, deleteExpense, updateExpense, loadExpenses };
};
