import { webcrypto } from 'node:crypto';

import { beforeAll, describe, expect, test } from 'vitest';

import {
  generatePassword,
  calculateGeneratedPasswordEntropy,
  calculatePassphraseEntropy,
  validatePasswordOptions,
  buildCharacterSet,
  parseWordList,
  generatePassphrase,
  formatPassphraseWord
} from '../public/assets/js/modules/generate_password.js';

describe('generate_password', () => {
  beforeAll(() => {
    if (!globalThis.crypto) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        configurable: true
      });
    }
  });

  test('validates that at least one character type is selected', () => {
    expect(validatePasswordOptions({
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false
    })).toBe(false);

    expect(validatePasswordOptions({
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false
    })).toBe(true);
  });

  test('builds a lowercase-only character set', () => {
    const characterSet = buildCharacterSet({
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false
    });

    expect(characterSet).toBe('abcdefghijklmnopqrstuvwxyz');
  });

  test('generates a password of the requested length', () => {
    const password = generatePassword(32, {
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true
    });

    expect(password).toHaveLength(32);
  });

  test('generates only lowercase characters when only lowercase is selected', () => {
    const password = generatePassword(64, {
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false
    });

    expect(password).toMatch(/^[a-z]+$/);
  });

  test('includes at least one selected character type where length allows it', () => {
    const password = generatePassword(32, {
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true
    });

    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[^a-zA-Z0-9]/);
  });

  test('returns an empty password when length is invalid', () => {
    const password = generatePassword(0, {
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true
    });

    expect(password).toBe('');
  });

  test('calculates generated password entropy from selected pool size', () => {
    const entropy = calculateGeneratedPasswordEntropy('aaaaaaaaaa', {
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false
    });

    expect(entropy).toBe(Math.round(10 * Math.log2(26)));
  });

  test('parses EFF-style wordlists', () => {
    const wordList = parseWordList(`
      11111 abacus
      11112 abdomen
      11113 abdominal
    `);

    expect(wordList).toEqual(['abacus', 'abdomen', 'abdominal']);
  });

  test('generates passphrases using the requested word count and delimiter', () => {
    const passphrase = generatePassphrase(['afflicted'], {
      wordCount: 3,
      delimiter: '-',
      caseMode: 'lowercase',
      substituteNumbers: false
    });

    expect(passphrase).toBe('afflicted-afflicted-afflicted');
  });

  test('formats passphrase words with optional case and number substitutions', () => {
    expect(formatPassphraseWord('afflicted', {
      caseMode: 'uppercase',
      substituteNumbers: false
    })).toBe('AFFLICTED');

    expect(formatPassphraseWord('afflicted', {
      caseMode: 'capitalise',
      substituteNumbers: false
    })).toBe('Afflicted');

    expect(formatPassphraseWord('afflicted', {
      caseMode: 'lowercase',
      substituteNumbers: true
    })).toBe('affl1cted');

    expect(formatPassphraseWord('door', {
      caseMode: 'lowercase',
      substituteNumbers: true
    })).toBe('d00r');
  });

  test('returns an empty passphrase when memorable options are invalid', () => {
    expect(generatePassphrase(['afflicted'], {
      wordCount: 0,
      delimiter: '-',
      caseMode: 'lowercase',
      substituteNumbers: false
    })).toBe('');

    expect(generatePassphrase([], {
      wordCount: 3,
      delimiter: '-',
      caseMode: 'lowercase',
      substituteNumbers: false
    })).toBe('');
  });

  test('calculates passphrase entropy from word count and wordlist size', () => {
    const entropy = calculatePassphraseEntropy(4, 7776);

    expect(entropy).toBe(Math.round(4 * Math.log2(7776)));
  });
});
