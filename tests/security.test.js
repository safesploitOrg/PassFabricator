import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { analysePassword } from '../public/assets/js/modules/analyse_password.js';
import {
  buildCharacterSet, calculateGeneratedPasswordEntropy, calculatePassphraseEntropy,
  formatPassphraseWord, generatePassphrase, generatePassword, parseWordList
} from '../public/assets/js/modules/generate_password.js';

const LOWERCASE = { includeLowercase: true };
const ALL_TYPES = { includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: true };

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('secure random generation', () => {
  test('fails closed without Web Crypto, without a Math.random fallback', () => {
    vi.stubGlobal('crypto', undefined);
    const RANDOM = vi.spyOn(Math, 'random');
    expect(() => generatePassword(16, ALL_TYPES)).toThrow('Web Crypto API is not available.');
    expect(() => generatePassphrase(['abacus'], { wordCount: 4 })).toThrow('Web Crypto API is not available.');
    expect(RANDOM).not.toHaveBeenCalled();
  });

  test('propagates crypto provider failure', () => {
    vi.stubGlobal('crypto', { getRandomValues() { throw new Error('Provider unavailable'); } });
    expect(() => generatePassword(1, LOWERCASE)).toThrow('Provider unavailable');
  });

  test('rejects the biased tail of the 32-bit range before indexing', () => {
    const VALUES = [0xffffffff, 25];
    const PROVIDER = vi.fn((array) => { array[0] = VALUES.shift(); return array; });
    vi.stubGlobal('crypto', { getRandomValues: PROVIDER });
    expect(generatePassword(1, LOWERCASE)).toBe('z');
    expect(PROVIDER).toHaveBeenCalledTimes(2);
  });

  test.each([0, -1, 1.5, NaN, Infinity, '12', null])('rejects invalid random length %s', (length) => {
    expect(generatePassword(length, ALL_TYPES)).toBe('');
  });

  test('returns empty with no selected character types', () => {
    expect(generatePassword(20, {})).toBe('');
    expect(buildCharacterSet({})).toBe('');
  });

  test.each(Array.from({ length: 15 }, (_, index) => index + 1))('respects character mask %i', (mask) => {
    const OPTIONS = {
      includeLowercase: Boolean(mask & 1), includeUppercase: Boolean(mask & 2),
      includeNumbers: Boolean(mask & 4), includeSymbols: Boolean(mask & 8)
    };
    const POOL = buildCharacterSet(OPTIONS);
    for (const LENGTH of [1, 3, 4, 20, 128]) {
      const PASSWORD = generatePassword(LENGTH, OPTIONS);
      expect(PASSWORD).toHaveLength(LENGTH);
      expect([...PASSWORD].every((character) => POOL.includes(character))).toBe(true);
      if (LENGTH >= 4) {
        if (OPTIONS.includeLowercase) expect(PASSWORD).toMatch(/[a-z]/);
        if (OPTIONS.includeUppercase) expect(PASSWORD).toMatch(/[A-Z]/);
        if (OPTIONS.includeNumbers) expect(PASSWORD).toMatch(/[0-9]/);
        if (OPTIONS.includeSymbols) expect(PASSWORD).toMatch(/[^a-zA-Z0-9]/);
      }
    }
  });
});

describe('analysis reference cases and misuse', () => {
  // Small independently calculated cases lock down the existing heuristic.
  test.each([['', 0, 0], ['a', 5, 26], ['bb', 9, 26], ['aA', 11, 52], ['aaaa', 0, 26], ['abcd', 4, 26]])(
    '%j has %i estimated bits and pool %i', (password, bits, pool) => {
      expect(analysePassword(password)).toMatchObject({ entropyBits: bits, detectedPoolSize: pool });
    }
  );

  test.each([null, undefined, 12345, '😀密碼', '\n\r\t', '<img src=x onerror=alert(1)>', 'a'.repeat(10_000)])(
    'handles empty, non-ASCII and hostile input without executing it', (password) => {
      const RESULT = analysePassword(password);
      expect(Number.isFinite(RESULT.entropyBits)).toBe(true);
      expect(RESULT.entropyBits).toBeGreaterThanOrEqual(0);
      expect(RESULT.strengthScore).toBeGreaterThanOrEqual(0);
      expect(RESULT.strengthScore).toBeLessThanOrEqual(100);
      expect(new Set(RESULT.feedback).size).toBe(RESULT.feedback.length);
    }
  );

  test.each(['111111111111', 'qwertyASDF', 'P@ssw0rd', '9876543210', 'ZZZZZZZZZZZZZZZZZZZZZZZZ'])('warns on predictable input %s', (password) => {
    expect(analysePassword(password).feedback.join(' ')).toMatch(/avoid|predictable/i);
  });

  test('gives length and entropy feedback to a long mixed password', () => {
    const RESULT = analysePassword('vN8#qL2%zR6&pX9*mK4^tB2+');
    expect(RESULT.feedback.join(' ')).toMatch(/Good length/);
    expect(RESULT.feedback.join(' ')).toMatch(/Estimated entropy is strong/);
  });
});

describe('wordlist and generator model references', () => {
  test('bundled EFF wordlist has 7,776 entries; the existing ASCII parser accepts 7,772', () => {
    const RAW = readFileSync(new URL('../public/assets/wordlist/eff_large_wordlist.txt', import.meta.url), 'utf8');
    const WORDS = parseWordList(RAW);
    expect(RAW.trim().split(/\r?\n/)).toHaveLength(7776);
    expect(WORDS).toHaveLength(7772);
    expect(new Set(WORDS).size).toBe(7772);
    expect(WORDS).not.toContain('drop-down');
    expect(WORDS).not.toContain('felt-tip');
    expect(WORDS).not.toContain('t-shirt');
    expect(WORDS).not.toContain('yo-yo');
  });

  test('rejects malformed entries and deduplicates case-insensitively', () => {
    expect(parseWordList('11111 Abacus\r\n11112 abacus\n<script>\n12345\n22222 door\n密碼\n')).toEqual(['abacus', 'door']);
    expect(parseWordList(null)).toEqual([]);
  });

  test('normalises supported passphrase formatting without adding randomness', () => {
    expect(generatePassphrase(['DOOR', '123', null], { wordCount: 2 })).toBe('door-door');
    expect(generatePassphrase(null, { wordCount: 2 })).toBe('');
    expect(formatPassphraseWord(null)).toBe('');
    expect(formatPassphraseWord('OIL', { caseMode: 'invalid', substituteNumbers: true })).toBe('01l');
    expect(generatePassphrase(['door'], { wordCount: 1, delimiter: null })).toBe('door');
  });

  test.each([[0, 7776], [4, 0], [-1, 7776], [NaN, 7776], [4, NaN], [4, Infinity]])('invalid model inputs return zero (%s, %s)', (count, size) => {
    expect(calculatePassphraseEntropy(count, size)).toBe(0);
  });

  test('independent uniform-choice reference values remain available as model helpers', () => {
    expect(calculatePassphraseEntropy(4, 7776)).toBe(52);
    expect(calculatePassphraseEntropy(6, 7776)).toBe(78);
    expect(calculateGeneratedPasswordEntropy('abcde', LOWERCASE)).toBe(24);
    expect(calculateGeneratedPasswordEntropy('', LOWERCASE)).toBe(0);
    expect(calculateGeneratedPasswordEntropy('abc', {})).toBe(0);
  });
});
