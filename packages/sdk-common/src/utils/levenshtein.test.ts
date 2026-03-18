import { describe, expect, it } from 'vitest';

import { levenshtein } from './levenshtein.js';

describe('levenshtein', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshtein('hello', 'hello')).toBe(0);
    expect(levenshtein('', '')).toBe(0);
  });

  it('should return length for empty string vs non-empty', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });

  it('should return 1 for single character difference', () => {
    expect(levenshtein('cat', 'bat')).toBe(1);
    expect(levenshtein('ab', 'abc')).toBe(1);
    expect(levenshtein('abc', 'ab')).toBe(1);
  });

  it('should return correct distance for common typos', () => {
    expect(levenshtein('Yers', 'Years')).toBe(1); // missing 'a'
    expect(levenshtein('Comerce', 'Commerce')).toBe(1); // missing 'm'
    expect(levenshtein('measureFactory.suum', 'measureFactory.sum')).toBe(1); // extra 'u'
  });

  it('should return correct distance for completely different strings', () => {
    expect(levenshtein('abc', 'xyz')).toBe(3);
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
});
