import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { clearPreferences, loadPreferences, savePreferences } from '../public/assets/js/modules/storage.js';

const STORAGE_KEY = 'passfabricator-preferences';
let VALUES;

beforeEach(() => {
  VALUES = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => VALUES.get(key) ?? null,
    setItem: (key, value) => VALUES.set(key, value),
    removeItem: (key) => VALUES.delete(key)
  });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('preference privacy and failure paths', () => {
  test('persists only allowlisted preferences, never password fields', () => {
    savePreferences({ password: 'synthetic-secret', analysisPassword: 'synthetic-secret', token: 'synthetic-secret' });
    const STORED = VALUES.get(STORAGE_KEY);
    expect(STORED).not.toContain('synthetic-secret');
    expect(STORED).not.toContain('password');
    expect(loadPreferences()).toMatchObject({ generatorType: 'random', length: 20 });
  });

  test.each(['{bad json', 'null', '{}', '[]', '"text"'])('removes malformed or expired data %s', (raw) => {
    VALUES.set(STORAGE_KEY, raw);
    expect(loadPreferences()).toBeNull();
    expect(VALUES.has(STORAGE_KEY)).toBe(false);
  });

  test('handles unavailable storage on read, write and delete', () => {
    vi.stubGlobal('localStorage', {
      getItem() { throw new Error('Storage blocked'); },
      setItem() { throw new Error('Storage blocked'); },
      removeItem() { throw new Error('Storage blocked'); }
    });
    expect(loadPreferences()).toBeNull();
    expect(savePreferences({})).toBe(false);
    expect(clearPreferences()).toBe(false);
  });

  test('defaults invalid values and sanitises delimiter control characters', () => {
    savePreferences({ length: 'bad', passphraseWordCount: 'bad', passphraseDelimiter: 42 });
    expect(loadPreferences()).toMatchObject({ length: 20, passphraseWordCount: 4, passphraseDelimiter: '-' });
    savePreferences({ length: -5, passphraseWordCount: -1, passphraseDelimiter: 'x\r\n\ty' });
    expect(loadPreferences()).toMatchObject({ length: 1, passphraseWordCount: 1, passphraseDelimiter: 'xy' });
  });

  test('expires preferences after 60 days', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000);
    savePreferences({});
    expect(JSON.parse(VALUES.get(STORAGE_KEY)).expiresAt).toBe(1_805_184_000_000);
    Date.now.mockReturnValue(1_805_184_000_001);
    expect(loadPreferences()).toBeNull();
  });
});
