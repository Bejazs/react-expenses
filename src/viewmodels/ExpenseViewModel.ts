import { useState, useEffect } from 'react';
import { Expense } from '../models/Expense';
import { getExpenses, saveExpenses } from '../services/ExpenseService';

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
