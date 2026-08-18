/**
 * Represents a single income item.
 */
export interface Income {
  /**
   * A unique identifier for the income.
   */
  id: string;
  /**
   * A description of the income (e.g., 'Base Salary', 'Bonus').
   */
  description: string;
  /**
   * The monetary value of the income.
   */
  amount: number;
  /**
   * The date the income was received, stored as an ISO 8601 string.
   */
  date: string;
  /**
   * Indicates if this income was generated automatically (e.g., the Base Salary).
   */
  isAutomatic?: boolean;
}
