import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Settings } from '../models/Settings';

const SETTINGS_FILE = 'settings.json';

const DEFAULT_SETTINGS: Settings = {
  currency: 'EUR',
};

const getSettingsFileUri = () => {
  return `${FileSystem.documentDirectory}${SETTINGS_FILE}`;
};

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
    const fileUri = getSettingsFileUri();
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
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
    const fileUri = getSettingsFileUri();
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
