import { Settings } from '../models/Settings';
import { hasKey, readJson, writeJson } from './storage/Storage';

const SETTINGS_KEY = 'settings';

export const DEFAULT_SETTINGS: Settings = {
  currency: 'EUR',
};

/**
 * Retrieves the application settings, saving the defaults on first use.
 */
export const getSettings = async (): Promise<Settings> => {
  if (!(await hasKey(SETTINGS_KEY))) {
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return readJson<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
};

/**
 * Saves the application settings.
 */
export const saveSettings = (settings: Settings): Promise<void> => writeJson(SETTINGS_KEY, settings);
