import { describe, expect, test } from 'vitest';

import {
  generatePassword,
  calculateGeneratedPasswordEntropy,
  validatePasswordOptions,
  buildCharacterSet
} from '../assets/js/modules/generate_password.js';

describe('generate_password', () => {
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
});