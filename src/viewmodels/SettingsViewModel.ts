import { Currency } from '../models/Settings';
import { useAppStore } from '../store/useAppStore';

/**
 * Settings data and actions, read from the global store.
 */
export const useSettingsViewModel = () => {
  const settings = useAppStore(s => s.settings);
  const loaded = useAppStore(s => s.loaded);
  const load = useAppStore(s => s.load);
  const updateSettings = useAppStore(s => s.updateSettings);

  /**
   * Updates the currency setting.
   */
  const setCurrency = (currency: Currency) => updateSettings({ currency });

  /**
   * Updates the AI settings.
   */
  const updateAISettings = (aiApiKey: string, aiProvider: string) => updateSettings({ aiApiKey, aiProvider });

  /**
   * Updates the salary cycle settings.
   */
  const updateSalarySettings = (baseSalary?: number, payday?: number, cycle?: 'calendar' | 'salary') =>
    updateSettings({
      baseSalary,
      payday,
      calculationCycle: cycle || settings.calculationCycle,
    });

  return {
    currency: settings.currency,
    aiApiKey: settings.aiApiKey,
    aiProvider: settings.aiProvider || 'openai',
    baseSalary: settings.baseSalary,
    payday: settings.payday,
    calculationCycle: settings.calculationCycle || 'calendar',
    loading: !loaded,
    setCurrency,
    updateAISettings,
    updateSalarySettings,
    loadSettings: load,
  };
};
