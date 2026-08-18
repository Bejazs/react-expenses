import { useState, useCallback } from 'react';
import { Income } from '../models/Income';
import { getIncomes, saveIncomes, syncAutoIncomes } from '../services/IncomeService';

export const useIncomeViewModel = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    // Sync automatically generated incomes based on settings first
    await syncAutoIncomes();
    
    // Load from storage
    const loadedIncomes = await getIncomes();
    setIncomes(loadedIncomes);
    setLoading(false);
  }, []);

  const addIncome = async (description: string, amount: number, date: string) => {
    const newIncome: Income = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      amount,
      date,
      isAutomatic: false
    };
    
    // Don't wait for sync here since it's already generated and we aren't editing settings.
    const currentIncomes = await getIncomes();
    const updatedIncomes = [...currentIncomes, newIncome];
    await saveIncomes(updatedIncomes);
    setIncomes(updatedIncomes);
  };

  const deleteIncome = async (id: string) => {
    const currentIncomes = await getIncomes();
    const updatedIncomes = currentIncomes.filter(i => i.id !== id);
    await saveIncomes(updatedIncomes);
    setIncomes(updatedIncomes);
  };

  return { incomes, loading, loadIncomes, addIncome, deleteIncome };
};
