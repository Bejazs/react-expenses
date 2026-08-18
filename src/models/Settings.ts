/**
 * Represents the currency type.
 * Can be 'EUR' for Euro or 'USD' for US Dollar.
 */
export type Currency = 'EUR' | 'USD';

/**
 * Represents the application settings.
 */
export interface Settings {
  /**
   * The selected currency for the application.
   */
  currency: Currency;

  /**
   * The AI Provider selected (e.g. 'openai', 'anthropic', etc.)
   */
  aiProvider?: string;

  /**
   * The API key for the selected AI agent feature.
   */
  aiApiKey?: string;

  /**
   * The base salary of the user.
   */
  baseSalary?: number;

  /**
   * The payday (day of the month, 1-31) when the salary is expected.
   */
  payday?: number;

  /**
   * The cycle mode for Dashboard calculation.
   * 'calendar' calculates per month (e.g. Nov 1st-30th)
   * 'salary' calculates from payday to next payday.
   */
  calculationCycle?: 'calendar' | 'salary';
}
