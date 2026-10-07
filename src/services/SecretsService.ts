import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const AI_API_KEY = 'aiApiKey';

/**
 * True when secrets only last for the browser session (web has no secure storage).
 */
export const secretsArePersistent = Platform.OS !== 'web';

const sessionStore = (): Storage | undefined =>
  (globalThis as { sessionStorage?: Storage }).sessionStorage;

/**
 * Reads the AI provider API key. On native it lives in the device's secure
 * storage (Keychain / Keystore); on web only in sessionStorage.
 */
export const getAiApiKey = async (): Promise<string | undefined> => {
  try {
    const value = secretsArePersistent
      ? await SecureStore.getItemAsync(AI_API_KEY)
      : sessionStore()?.getItem(AI_API_KEY);
    return value || undefined;
  } catch (error) {
    console.error('Error reading the AI API key:', error);
    return undefined;
  }
};

/**
 * Saves the AI provider API key. An empty value removes it.
 */
export const setAiApiKey = async (key: string): Promise<void> => {
  const value = key.trim();
  if (!value) return clearAiApiKey();
  if (secretsArePersistent) {
    await SecureStore.setItemAsync(AI_API_KEY, value);
  } else {
    sessionStore()?.setItem(AI_API_KEY, value);
  }
};

/**
 * Removes the AI provider API key.
 */
export const clearAiApiKey = async (): Promise<void> => {
  if (secretsArePersistent) {
    await SecureStore.deleteItemAsync(AI_API_KEY);
  } else {
    sessionStore()?.removeItem(AI_API_KEY);
  }
};

/**
 * Masks a key for display, keeping its prefix and last 4 characters: "sk-…a1b2".
 */
export const maskApiKey = (key: string | undefined): string => {
  if (!key) return '';
  const prefix = key.match(/^[A-Za-z]+-/)?.[0] ?? '';
  if (key.length <= prefix.length + 4) return '…';
  return `${prefix}…${key.slice(-4)}`;
};
