import * as SecureStore from 'expo-secure-store';
import { clearAiApiKey, getAiApiKey, maskApiKey, setAiApiKey } from './SecretsService';

const secureStore = (SecureStore as unknown as { __store: Map<string, string> }).__store;

describe('SecretsService (native)', () => {
  beforeEach(() => secureStore.clear());

  it('saves, reads and clears the key in secure storage', async () => {
    expect(await getAiApiKey()).toBeUndefined();
    await setAiApiKey('  sk-abc123  ');
    expect(await getAiApiKey()).toBe('sk-abc123');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('aiApiKey', 'sk-abc123');
    await clearAiApiKey();
    expect(await getAiApiKey()).toBeUndefined();
  });

  it('treats an empty key as removal', async () => {
    await setAiApiKey('sk-abc123');
    await setAiApiKey('   ');
    expect(await getAiApiKey()).toBeUndefined();
  });
});

describe('maskApiKey', () => {
  it('keeps the prefix and the last 4 characters', () => {
    expect(maskApiKey('sk-proj-abcdefa1b2')).toBe('sk-…a1b2');
    expect(maskApiKey('AIzaSyXXXXXXXX9f3c')).toBe('…9f3c');
  });

  it('hides short or missing keys completely', () => {
    expect(maskApiKey('sk-12')).toBe('…');
    expect(maskApiKey(undefined)).toBe('');
  });
});
