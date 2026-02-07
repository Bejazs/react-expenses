import { getSettings, saveSettings } from './SettingsService';
import { Settings } from '../models/Settings';
import * as FileSystem from 'expo-file-system';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock FileSystem
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://document-directory/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web', // Default to web for simplicity, can change per test
  },
}));

describe('SettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Web', () => {
    it('should return default settings if no settings are saved', async () => {
      const settings = await getSettings();
      expect(settings).toEqual({ currency: 'EUR' });
    });

    it('should save and retrieve settings', async () => {
      const newSettings: Settings = { currency: 'USD' };
      await saveSettings(newSettings);
      const retrievedSettings = await getSettings();
      expect(retrievedSettings).toEqual(newSettings);
    });
  });

  // Since we are mocking Platform.OS as 'web' by default, native tests would require re-mocking or separate describe block.
  // For simplicity and to avoid complexity with re-mocking imports, we rely on the implementation using common logic or distinct blocks.
  // However, let's verify native calls are mocked correctly if we were on native.
});
