/**
 * Property tests for PasswordStrengthIndicator logic
 *
 * Property 4: Password that meets all 4 criteria always produces level "Sangat Kuat"
 * Property 5: Empty password always produces level "Lemah"
 * Validates: Requirements 10.4, 10.5
 */

import { describe, it, expect } from 'vitest';
import { evaluatePasswordStrength } from '../pages/Register';

describe('PasswordStrengthIndicator — Property 4 & 5 (Validates: Requirements 10.4, 10.5)', () => {

  // Property 5: Empty password → always "Lemah"
  it('Property 5: empty password always produces level "Lemah"', () => {
    const result = evaluatePasswordStrength('');
    expect(result.level).toBe('Lemah');
    expect(result.score).toBe(0);
  });

  it('Property 5: null/undefined-like empty string always produces level "Lemah"', () => {
    const result = evaluatePasswordStrength('');
    expect(result.level).toBe('Lemah');
  });

  // Property 4: Password meeting all 4 criteria → always "Sangat Kuat"
  it('Property 4: password meeting all 4 criteria always produces "Sangat Kuat"', () => {
    // Criteria: length >= 8, uppercase, digit, special char
    const strongPasswords = [
      'Abcdef1!',
      'MyP@ssw0rd',
      'Secure#99',
      'Hello$World1',
      'Test1234!',
      'Aa1!aaaa',
    ];

    for (const pwd of strongPasswords) {
      const result = evaluatePasswordStrength(pwd);
      expect(
        result.level,
        `Password "${pwd}" should be "Sangat Kuat" but got "${result.level}"`
      ).toBe('Sangat Kuat');
      expect(result.score).toBe(4);
    }
  });

  // Criteria evaluation correctness
  it('password shorter than 8 chars does not get length criterion', () => {
    // "Aa1!" — has uppercase, digit, special, but length < 8 → score 3 → "Kuat"
    const result = evaluatePasswordStrength('Aa1!');
    expect(result.score).toBe(3);
    expect(result.level).toBe('Kuat');
  });

  it('password with only lowercase letters scores 0 criteria → "Lemah"', () => {
    const result = evaluatePasswordStrength('abc');
    expect(result.score).toBe(0);
    expect(result.level).toBe('Lemah');
  });

  it('password with length >= 8 and uppercase only scores 2 → "Cukup"', () => {
    // length >= 8 ✓, uppercase ✓, no digit, no special
    const result = evaluatePasswordStrength('Abcdefgh');
    expect(result.score).toBe(2);
    expect(result.level).toBe('Cukup');
  });

  it('password with length >= 8, uppercase, and digit scores 3 → "Kuat"', () => {
    const result = evaluatePasswordStrength('Abcdefg1');
    expect(result.score).toBe(3);
    expect(result.level).toBe('Kuat');
  });

  // Score is always 0–4
  it('score is always between 0 and 4 for any input', () => {
    const inputs = ['', 'a', 'Aa1!', 'Abcdef1!', 'AAAAAAAAAA', '12345678', '!@#$%^&*'];
    for (const pwd of inputs) {
      const { score } = evaluatePasswordStrength(pwd);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(4);
    }
  });

  // Width corresponds to score
  it('width values correspond to score levels', () => {
    const cases = [
      { pwd: '',          expectedWidth: '0%'   },
      { pwd: 'abc',       expectedWidth: '25%'  },
      { pwd: 'Abcdefgh',  expectedWidth: '50%'  },
      { pwd: 'Abcdefg1',  expectedWidth: '75%'  },
      { pwd: 'Abcdef1!',  expectedWidth: '100%' },
    ];
    for (const { pwd, expectedWidth } of cases) {
      const { width } = evaluatePasswordStrength(pwd);
      expect(width, `Password "${pwd}" should have width ${expectedWidth}`).toBe(expectedWidth);
    }
  });
});
