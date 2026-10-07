import { useAppStore } from '../store/useAppStore';

/**
 * Category data and actions, read from the global store.
 */
export const useCategoryViewModel = () => {
  const categories = useAppStore(s => s.categories);
  const loaded = useAppStore(s => s.loaded);
  const load = useAppStore(s => s.load);
  const add = useAppStore(s => s.addCategory);
  const deleteCategory = useAppStore(s => s.deleteCategory);
  const updateCategory = useAppStore(s => s.updateCategory);

  /**
   * Adds a new category.
   */
  const addCategory = (name: string, icon: string, color: string) => add({ name, icon, color });

  return { categories, loading: !loaded, addCategory, deleteCategory, updateCategory, loadCategories: load };
};
