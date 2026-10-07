import { useState, useEffect, useRef } from 'react';
import { Expense } from '../models/Expense';
import { getExpenses, saveExpenses } from '../services/ExpenseService';
import { generateId } from '../utils/id';

/**
 * Appends new expenses to a list, assigning each one a fresh id.
 */
export const appendExpenses = (
  current: Expense[],
  items: Omit<Expense, 'id'>[],
  createId: () => string = generateId
): Expense[] => [...current, ...items.map(item => ({ ...item, id: createId() }))];

/**
 * A custom hook for managing expense data.
 * It handles loading, adding, updating, deleting, and storing expenses.
 *
 * @returns {{
 *   expenses: Expense[],
 *   loading: boolean,
 *   addExpense: (description: string, amount: number, date: string, categoryId: string) => Promise<void>,
 *   addExpenses: (items: Omit<Expense, 'id'>[]) => Promise<number>,
 *   deleteExpense: (id: string) => Promise<void>,
 *   updateExpense: (updatedExpense: Expense) => Promise<void>,
 *   loadExpenses: () => Promise<void>
 * }} An object containing the expenses, loading state, and functions to manage expenses.
 */
export const useExpenseViewModel = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  // Latest list, updated synchronously so consecutive calls in the same render
  // never work from a stale `expenses` closure.
  const expensesRef = useRef<Expense[]>([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  /**
   * Loads expenses from the persistence layer (file system or local storage).
   */
  const loadExpenses = async () => {
    setLoading(true);
    const loadedExpenses = await getExpenses();
    expensesRef.current = loadedExpenses;
    setExpenses(loadedExpenses);
    setLoading(false);
  };

  /**
   * Applies a change to the latest expense list, updates state and persists it once.
   */
  const commit = async (update: (current: Expense[]) => Expense[]) => {
    const updatedExpenses = update(expensesRef.current);
    expensesRef.current = updatedExpenses;
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
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
    await commit(current => appendExpenses(current, [{ description, amount, date, categoryId }]));
  };

  /**
   * Adds several expenses at once and saves them in a single write.
   *
   * @param items - The expenses to add (without ids).
   * @returns The number of expenses saved.
   */
  const addExpenses = async (items: Omit<Expense, 'id'>[]) => {
    if (items.length === 0) return 0;
    await commit(current => appendExpenses(current, items));
    return items.length;
  };

  /**
   * Deletes an expense by its ID.
   *
   * @param {string} id - The ID of the expense to delete.
   */
  const deleteExpense = async (id: string) => {
    await commit(current => current.filter((e) => e.id !== id));
  };

  /**
   * Updates an existing expense.
   *
   * @param {Expense} updatedExpense - The expense object with updated properties.
   */
  const updateExpense = async (updatedExpense: Expense) => {
    await commit(current =>
      current.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
  };

  return { expenses, loading, addExpense, addExpenses, deleteExpense, updateExpense, loadExpenses };
};
