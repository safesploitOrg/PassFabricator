import { describe, expect, test } from 'vitest';

import {
  analysePassword
} from '../public/assets/js/modules/analyse_password.js';

describe('analyse_password', () => {
  test('returns empty analysis for an empty password', () => {
    const analysis = analysePassword('');

    expect(analysis.strengthScore).toBe(0);
    expect(analysis.entropyBits).toBe(0);
    expect(analysis.detectedPoolSize).toBe(0);
    expect(analysis.feedback.length).toBeGreaterThan(0);
  });

  test('detects lowercase-only password pool', () => {
    const analysis = analysePassword('correcthorsebatterystaple');

    expect(analysis.detectedPoolSize).toBe(26);
    expect(analysis.entropyBits).toBeGreaterThan(0);
  });

  test('detects mixed character pool', () => {
    const analysis = analysePassword('A9!examplePassword');

    expect(analysis.detectedPoolSize).toBeGreaterThanOrEqual(94);
  });

  test('penalises common password terms', () => {
    const weak = analysePassword('Password123!');
    const stronger = analysePassword('vN8!qL2#zR7@pX5');

    expect(weak.strengthScore).toBeLessThan(stronger.strengthScore);
    expect(weak.feedback.join(' ')).toMatch(/common words/i);
  });

  test('penalises sequential patterns', () => {
    const analysis = analysePassword('abcd1234XYZ!');

    expect(analysis.feedback.join(' ')).toMatch(/sequences/i);
  });

  test('gives stronger score to long random-looking passwords', () => {
    const weak = analysePassword('password');
    const strong = analysePassword('xQ9!mT2#vL8@zP5$rN7%');

    expect(strong.strengthScore).toBeGreaterThan(weak.strengthScore);
    expect(strong.entropyBits).toBeGreaterThan(weak.entropyBits);
  });
});