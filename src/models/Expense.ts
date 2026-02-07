/**
 * Represents a single expense item.
 */
export interface Expense {
  /**
   * A unique identifier for the expense.
   */
  id: string;
  /**
   * A description of the expense.
   */
  description: string;
  /**
   * The monetary value of the expense.
   */
  amount: number;
  /**
   * The date the expense was incurred, stored as an ISO 8601 string.
   */
  date: string;
  /**
   * The ID of the category this expense belongs to.
   */
  categoryId: string;
}
