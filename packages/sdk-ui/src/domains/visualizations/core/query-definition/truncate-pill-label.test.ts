import { describe, expect, it } from 'vitest';

import { truncatePillLabel } from './truncate-pill-label';

describe('truncatePillLabel', () => {
  it('returns the label unchanged when maxLength is 0', () => {
    expect(truncatePillLabel('abcdefghijklmnopqrst', 0)).toBe('abcdefghijklmnopqrst');
  });

  it('returns the label unchanged when maxLength is negative', () => {
    expect(truncatePillLabel('short', -1)).toBe('short');
  });

  it('returns the label unchanged when it fits within maxLength', () => {
    expect(truncatePillLabel('exactly-twenty-chars', 20)).toBe('exactly-twenty-chars');
  });

  it('truncates to maxLength characters and appends an ellipsis', () => {
    expect(truncatePillLabel('abcdefghijklmnopqrst', 10)).toBe('abcdefghij...');
  });
});
