/*
    * PassFabricator - A simple password generator for the web
    Author: Zepher Ashe (@safesploit)
    Repository: https://github.com/safesploitOrg/PassFabricator    
*/

// Web Storage module for PassFabricator options/preferences with TTL and sanitisation.
// Preferences are stored in localStorage under the key 'passfabricator-preferences' and include a timestamp for expiry (60 days).

const STORAGE_KEY = 'passfabricator-preferences';
const STORAGE_TTL_DAYS = 60;
const STORAGE_TTL_MS = STORAGE_TTL_DAYS * 24 * 60 * 60 * 1000;

const DEFAULT_PREFERENCES = {
  length: 12,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true
};

export function savePreferences(preferences) {
  const safePreferences = sanitisePreferences(preferences);

  const storedPreferences = {
    ...safePreferences,
    expiresAt: getStorageExpiryTimestamp()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPreferences));
    return true;
  } catch (error) {
    console.warn('Unable to save PassFabricator preferences:', error);
    return false;
  }
}

export function loadPreferences() {
  let rawPreferences;

  try {
    rawPreferences = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read PassFabricator preferences:', error);
    return null;
  }

  if (!rawPreferences) {
    return null;
  }

  try {
    const parsedPreferences = JSON.parse(rawPreferences);

    if (isExpired(parsedPreferences)) {
      clearPreferences();
      return null;
    }

    return sanitisePreferences(parsedPreferences);
  } catch (error) {
    clearPreferences();
    return null;
  }
}

export function clearPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('Unable to clear PassFabricator preferences:', error);
    return false;
  }
}

function getStorageExpiryTimestamp() {
  return Date.now() + STORAGE_TTL_MS;
}

function isExpired(preferences) {
  return !preferences.expiresAt || Date.now() > preferences.expiresAt;
}

function sanitisePreferences(preferences) {
  return {
    length: sanitiseLength(preferences?.length),
    includeLowercase: sanitiseBoolean(
      preferences?.includeLowercase,
      DEFAULT_PREFERENCES.includeLowercase
    ),
    includeUppercase: sanitiseBoolean(
      preferences?.includeUppercase,
      DEFAULT_PREFERENCES.includeUppercase
    ),
    includeNumbers: sanitiseBoolean(
      preferences?.includeNumbers,
      DEFAULT_PREFERENCES.includeNumbers
    ),
    includeSymbols: sanitiseBoolean(
      preferences?.includeSymbols,
      DEFAULT_PREFERENCES.includeSymbols
    )
  };
}

function sanitiseLength(length) {
  const parsedLength = Number.parseInt(length, 10);

  if (!Number.isInteger(parsedLength)) {
    return DEFAULT_PREFERENCES.length;
  }

  return Math.min(Math.max(parsedLength, 1), 128);
}

function sanitiseBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}