import { Currency, Settings } from '../models/Settings';
import { useAppStore } from '../store/useAppStore';
import { maskApiKey, secretsArePersistent } from '../services/SecretsService';

/**
 * Settings data and actions, read from the global store.
 */
export const useSettingsViewModel = () => {
  const settings = useAppStore(s => s.settings);
  const loaded = useAppStore(s => s.loaded);
  const load = useAppStore(s => s.load);
  const updateSettings = useAppStore(s => s.updateSettings);
  const aiApiKey = useAppStore(s => s.aiApiKey);
  const saveAiApiKey = useAppStore(s => s.setAiApiKey);
  const removeAiApiKey = useAppStore(s => s.clearAiApiKey);

  /**
   * Updates the currency setting.
   */
  const setCurrency = (currency: Currency) => updateSettings({ currency });

  /**
   * Updates the color scheme preference.
   */
  const setAppearance = (appearance: NonNullable<Settings['appearance']>) => updateSettings({ appearance });

  /**
   * Updates the AI provider and, when a new key is typed, saves it to secure storage.
   */
  const updateAISettings = async (newKey: string, aiProvider: string) => {
    await updateSettings({ aiProvider });
    if (newKey.trim()) await saveAiApiKey(newKey);
  };

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
    aiApiKey,
    maskedAiApiKey: maskApiKey(aiApiKey),
    aiApiKeyPersists: secretsArePersistent,
    aiProvider: settings.aiProvider || 'openai',
    baseSalary: settings.baseSalary,
    payday: settings.payday,
    calculationCycle: settings.calculationCycle || 'calendar',
    appearance: settings.appearance || 'system',
    loading: !loaded,
    setCurrency,
    setAppearance,
    updateAISettings,
    removeAiApiKey,
    updateSalarySettings,
    loadSettings: load,
  };
};
