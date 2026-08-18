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
}
