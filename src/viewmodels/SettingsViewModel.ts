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
    setLoading(false);
  };

  /**
   * Updates the currency setting.
   *
   * @param {Currency} newCurrency - The new currency to set.
   */
  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    await saveSettings({ currency: newCurrency });
  };

  return { currency, loading, setCurrency, loadSettings };
};
