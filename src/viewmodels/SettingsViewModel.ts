import { useState, useEffect } from 'react';
import { Settings, Currency } from '../models/Settings';
import { getSettings, saveSettings } from '../services/SettingsService';

/**
 * A custom hook for managing application settings.
 *
 * @returns {{
 *   currency: Currency,
 *   loading: boolean,
 *   setCurrency: (currency: Currency) => Promise<void>,
 *   loadSettings: () => Promise<void>
 * }} An object containing the current currency, loading state, and functions to update settings.
 */
export const useSettingsViewModel = () => {
  const [currency, setCurrencyState] = useState<Currency>('EUR');
  const [openaiApiKey, setOpenaiApiKey] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Loads settings from the persistence layer.
   */
  const loadSettings = async () => {
    setLoading(true);
    const settings = await getSettings();
    setCurrencyState(settings.currency);
    setOpenaiApiKey(settings.openaiApiKey);
    setLoading(false);
  };

  /**
   * Updates the currency setting.
   *
   * @param {Currency} newCurrency - The new currency to set.
   */
  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    await saveSettings({ currency: newCurrency, openaiApiKey });
  };

  /**
   * Updates the OpenAI API Key setting.
   *
   * @param {string} newKey - The new key to set.
   */
  const updateOpenaiApiKey = async (newKey: string) => {
    setOpenaiApiKey(newKey);
    await saveSettings({ currency, openaiApiKey: newKey });
  };

  return { currency, openaiApiKey, loading, setCurrency, updateOpenaiApiKey, loadSettings };
};
