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
  const [aiApiKey, setAiApiKey] = useState<string | undefined>(undefined);
  const [aiProvider, setAiProvider] = useState<string>('openai');
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
    setAiApiKey(settings.aiApiKey);
    setAiProvider(settings.aiProvider || 'openai');
    setLoading(false);
  };

  /**
   * Updates the currency setting.
   *
   * @param {Currency} newCurrency - The new currency to set.
   */
  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    await saveSettings({ currency: newCurrency, aiApiKey, aiProvider });
  };

  /**
   * Updates the AI settings.
   */
  const updateAISettings = async (newKey: string, newProvider: string) => {
    setAiApiKey(newKey);
    setAiProvider(newProvider);
    await saveSettings({ currency, aiApiKey: newKey, aiProvider: newProvider });
  };

  return { currency, aiApiKey, aiProvider, loading, setCurrency, updateAISettings, loadSettings };
};
