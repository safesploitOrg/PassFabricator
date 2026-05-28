import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  clearPreferences,
  loadPreferences,
  savePreferences
} from '../assets/js/modules/storage.js';

function createLocalStorageMock() {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
}

describe('storage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true
    });
  });

  test('saves and loads preferences', () => {
    const preferences = {
      length: 32,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: false
    };

    expect(savePreferences(preferences)).toBe(true);
    expect(loadPreferences()).toEqual(preferences);
  });

  test('sanitises invalid length when saving', () => {
    savePreferences({
      length: 999,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true
    });

    const preferences = loadPreferences();

    expect(preferences.length).toBe(128);
  });

  test('returns null when no preferences exist', () => {
    expect(loadPreferences()).toBe(null);
  });

  test('clears saved preferences', () => {
    savePreferences({
      length: 32,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true
    });

    expect(clearPreferences()).toBe(true);
    expect(loadPreferences()).toBe(null);
  });

  test('removes expired preferences', () => {
    const expiredPreferences = {
      length: 32,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
      expiresAt: Date.now() - 1000
    };

    localStorage.setItem(
      'passfabricator-preferences',
      JSON.stringify(expiredPreferences)
    );

    expect(loadPreferences()).toBe(null);
    expect(localStorage.removeItem).toHaveBeenCalledWith('passfabricator-preferences');
  });
});