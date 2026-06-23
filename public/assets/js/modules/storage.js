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
const MAX_PASSPHRASE_DELIMITER_LENGTH = 8;
const GENERATOR_TYPES = new Set(['random', 'memorable']);
const PASSPHRASE_CASE_MODES = new Set(['lowercase', 'uppercase', 'capitalise']);

const DEFAULT_PREFERENCES = {
  generatorType: 'random',
  length: 20,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  passphraseWordCount: 4,
  passphraseDelimiter: '-',
  passphraseCase: 'lowercase',
  passphraseUseNumbers: false
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
    generatorType: sanitiseGeneratorType(preferences?.generatorType),
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
    ),
    passphraseWordCount: sanitisePassphraseWordCount(preferences?.passphraseWordCount),
    passphraseDelimiter: sanitisePassphraseDelimiter(preferences?.passphraseDelimiter),
    passphraseCase: sanitisePassphraseCase(preferences?.passphraseCase),
    passphraseUseNumbers: sanitiseBoolean(
      preferences?.passphraseUseNumbers,
      DEFAULT_PREFERENCES.passphraseUseNumbers
    )
  };
}

function sanitiseGeneratorType(generatorType) {
  return GENERATOR_TYPES.has(generatorType) ? generatorType : DEFAULT_PREFERENCES.generatorType;
}

function sanitiseLength(length) {
  const parsedLength = Number.parseInt(length, 10);

  if (!Number.isInteger(parsedLength)) {
    return DEFAULT_PREFERENCES.length;
  }

  return Math.min(Math.max(parsedLength, 1), 128);
}

function sanitisePassphraseWordCount(wordCount) {
  const parsedWordCount = Number.parseInt(wordCount, 10);

  if (!Number.isInteger(parsedWordCount)) {
    return DEFAULT_PREFERENCES.passphraseWordCount;
  }

  return Math.min(Math.max(parsedWordCount, 1), 20);
}

function sanitisePassphraseDelimiter(delimiter) {
  if (typeof delimiter !== 'string') {
    return DEFAULT_PREFERENCES.passphraseDelimiter;
  }

  return delimiter.replace(/[\r\n\t]/g, '').slice(0, MAX_PASSPHRASE_DELIMITER_LENGTH);
}

function sanitisePassphraseCase(caseMode) {
  return PASSPHRASE_CASE_MODES.has(caseMode) ? caseMode : DEFAULT_PREFERENCES.passphraseCase;
}

function sanitiseBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}
