import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Settings } from '../models/Settings';

const SETTINGS_FILE = 'settings.json';

const DEFAULT_SETTINGS: Settings = {
  currency: 'EUR',
};

let settingsFile: FileSystem.File | null = null;

if (Platform.OS !== 'web') {
  try {
    const { File, Paths } = FileSystem;
    settingsFile = new File(Paths.document, SETTINGS_FILE);
  } catch (e) {
    console.warn('Failed to initialize FileSystem for settings:', e);
  }
}

/**
 * Retrieves the application settings.
 * Uses localStorage on Web and FileSystem on Native.
 * @returns {Promise<Settings>}
 */
export const getSettings = async (): Promise<Settings> => {
  if (Platform.OS === 'web') {
    const data = localStorage.getItem('settings');
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  try {
    if (settingsFile?.exists) {
      const fileContent = await settingsFile.text();
      return JSON.parse(fileContent);
    }
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Saves the application settings.
 * Uses localStorage on Web and FileSystem on Native.
 * @param {Settings} settings - The settings object to save.
 */
export const saveSettings = async (settings: Settings): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem('settings', JSON.stringify(settings));
    return;
  }

  try {
    if (settingsFile) {
      settingsFile.write(JSON.stringify(settings, null, 2));
    }
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
