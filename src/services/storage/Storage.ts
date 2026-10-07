import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Single persistence layer for the app.
 * Each key is stored as `<key>.json` in the document directory on native,
 * and under `<key>` in localStorage on web.
 */
const files = new Map<string, FileSystem.File>();

const getFile = (key: string): FileSystem.File | null => {
  let file = files.get(key);
  if (!file) {
    try {
      const { File, Paths } = FileSystem;
      file = new File(Paths.document, `${key}.json`);
      files.set(key, file);
    } catch (e) {
      console.warn(`Failed to initialize storage for "${key}":`, e);
      return null;
    }
  }
  return file;
};

/**
 * Reads a JSON value. Returns `fallback` when nothing is stored or the data is unreadable.
 */
export const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    if (Platform.OS === 'web') {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T) : fallback;
    }
    const file = getFile(key);
    if (file?.exists) {
      return JSON.parse(await file.text()) as T;
    }
    return fallback;
  } catch (error) {
    console.error(`Error reading "${key}":`, error);
    return fallback;
  }
};

/**
 * Returns true when a value has been stored for `key`.
 */
export const hasKey = async (key: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key) !== null;
  }
  return Boolean(getFile(key)?.exists);
};

/**
 * Writes a JSON value.
 */
export const writeJson = async <T>(key: string, value: T): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    getFile(key)?.write(JSON.stringify(value, null, 2));
  } catch (error) {
    console.error(`Error saving "${key}":`, error);
  }
};
