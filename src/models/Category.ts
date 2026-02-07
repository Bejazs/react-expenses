/**
 * Represents a category for expenses.
 */
export interface Category {
  /**
   * Unique identifier for the category.
   */
  id: string;
  /**
   * Display name of the category.
   */
  name: string;
  /**
   * Icon name (e.g., from MaterialIcons or Ionicons).
   */
  icon: string;
  /**
   * Color associated with the category (hex code).
   */
  color: string;
}
