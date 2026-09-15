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

  it('truncates a filter chip from the value side so the label stays intact', () => {
    expect(truncatePillLabel('Category: Calculators, Camera Flashes', 25)).toBe(
      'Category: Calculators, Ca...',
    );
  });

  it('keeps the full label prefix when maxLength is shorter than the Label colon prefix', () => {
    expect(truncatePillLabel('Country: United States', 5)).toBe('Country: ...');
  });

  it('keeps later colons inside the value when truncating a filter chip', () => {
    expect(truncatePillLabel('Hours in Date: 10:00 to 11:00', 22)).toBe(
      'Hours in Date: 10:00 t...',
    );
  });
});
