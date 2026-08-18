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
   * The OpenAI API key for the AI agent feature.
   */
  openaiApiKey?: string;
}
