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
  const [baseSalary, setBaseSalary] = useState<number | undefined>(undefined);
  const [payday, setPayday] = useState<number | undefined>(undefined);
  const [calculationCycle, setCalculationCycle] = useState<'calendar' | 'salary'>('calendar');
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
    setBaseSalary(settings.baseSalary);
    setPayday(settings.payday);
    setCalculationCycle(settings.calculationCycle || 'calendar');
    setLoading(false);
  };

  /**
   * Updates the currency setting.
   *
   * @param {Currency} newCurrency - The new currency to set.
   */
  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    await saveSettings({ currency: newCurrency, aiApiKey, aiProvider, baseSalary, payday, calculationCycle });
  };

  /**
   * Updates the AI settings.
   */
  const updateAISettings = async (newKey: string, newProvider: string) => {
    setAiApiKey(newKey);
    setAiProvider(newProvider);
    await saveSettings({ currency, aiApiKey: newKey, aiProvider: newProvider, baseSalary, payday, calculationCycle });
  };

  /**
   * Updates the salary cycle settings.
   */
  const updateSalarySettings = async (salary_?: number, pay_ ?: number, cycle_ ?: 'calendar' | 'salary') => {
    setBaseSalary(salary_);
    setPayday(pay_);
    if (cycle_) setCalculationCycle(cycle_);
    
    await saveSettings({
      currency,
      aiApiKey,
      aiProvider,
      baseSalary: salary_,
      payday: pay_,
      calculationCycle: cycle_ || calculationCycle,
    });
  };

  return { currency, aiApiKey, aiProvider, baseSalary, payday, calculationCycle, loading, setCurrency, updateAISettings, updateSalarySettings, loadSettings };
};
