import { useState, useEffect } from 'react';
import { Category } from '../models/Category';
import { getCategories, saveCategories } from '../services/ExpenseService';

/**
 * A custom hook for managing category data.
 * It handles loading, adding, updating, deleting, and storing categories.
 *
 * @returns {{
 *   categories: Category[],
 *   loading: boolean,
 *   addCategory: (name: string, icon: string, color: string) => Promise<void>,
 *   deleteCategory: (id: string) => Promise<void>,
 *   updateCategory: (updatedCategory: Category) => Promise<void>,
 *   loadCategories: () => Promise<void>
 * }} An object containing the categories, loading state, and functions to manage categories.
 */
export const useCategoryViewModel = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Loads categories from the persistence layer (file system or local storage).
   */
  const loadCategories = async () => {
    setLoading(true);
    const loadedCategories = await getCategories();
    setCategories(loadedCategories);
    setLoading(false);
  };

  /**
   * Adds a new category.
   *
   * @param {string} name - The name of the category.
   * @param {string} icon - The icon name for the category.
   * @param {string} color - The color hex code for the category.
   */
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

  /**
   * Deletes a category by its ID.
   *
   * @param {string} id - The ID of the category to delete.
   */
  const deleteCategory = async (id: string) => {
    const updatedCategories = categories.filter((c) => c.id !== id);
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);
  };

  /**
   * Updates an existing category.
   *
   * @param {Category} updatedCategory - The category object with updated properties.
   */
  const updateCategory = async (updatedCategory: Category) => {
    const updatedCategories = categories.map((c) =>
      c.id === updatedCategory.id ? updatedCategory : c
    );
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);
  };

  return { categories, loading, addCategory, deleteCategory, updateCategory, loadCategories };
};
