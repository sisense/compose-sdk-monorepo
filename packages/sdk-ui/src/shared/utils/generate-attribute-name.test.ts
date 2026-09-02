import { DateLevels } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { generateAttributeName } from './generate-attribute-name';

// Stands in for i18next: reports the key it was asked for and the column it was given.
const t = ((key: string, options?: { columnName?: string }) =>
  `${key}(${options?.columnName ?? ''})`) as never;

describe('generateAttributeName', () => {
  it('names a date level after its granularity and column', () => {
    expect(generateAttributeName(t, 'Date', DateLevels.Years)).toBe(
      'attribute.datetimeName.years(Date)',
    );
  });

  it('names a column with no granularity after itself', () => {
    expect(generateAttributeName(t, 'Country')).toBe('Country');
  });

  /* Fusion buckets minutes at 30 and 1 as well, and those granularities have no name of their
     own — asking for a missing key would leave the attribute nameless. */
  it('falls back to the column name for a granularity it has no name for', () => {
    expect(generateAttributeName(t, 'Date', DateLevels.AggMinutesRoundTo30)).toBe('Date');
    expect(generateAttributeName(t, 'Date', DateLevels.AggMinutesRoundTo1)).toBe('Date');
  });
});
