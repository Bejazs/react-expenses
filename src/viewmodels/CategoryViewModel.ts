import { useState, useEffect } from 'react';
import { Category } from '../models/Category';
import { getCategories, saveCategories } from '../services/ExpenseService';

export const useCategoryViewModel = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const loadedCategories = await getCategories();
    setCategories(loadedCategories);
    setLoading(false);
  };

  const addCategory = async (name: string, icon: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      icon,
      color,
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);
  };

  const deleteCategory = async (id: string) => {
    const updatedCategories = categories.filter((c) => c.id !== id);
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);
  };

  const updateCategory = async (updatedCategory: Category) => {
    const updatedCategories = categories.map((c) =>
      c.id === updatedCategory.id ? updatedCategory : c
    );
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);
  };

  return { categories, loading, addCategory, deleteCategory, updateCategory, loadCategories };
};
