import { describe, expect, it } from 'vitest';

import {
  extractSeriesLabelAffixFromFusion,
  toPublicSeriesLabelAffixFields,
} from './series-label-affix-style.js';

describe('series-label-affix-style', () => {
  it('extractSeriesLabelAffixFromFusion preserves explicit null clears internally', () => {
    expect(
      extractSeriesLabelAffixFromFusion({
        backgroundColor: null,
        borderColor: null,
      }),
    ).toEqual({
      backgroundColor: null,
      padding: null,
      borderColor: null,
      borderWidth: null,
      borderRadius: null,
    });
  });

  it('toPublicSeriesLabelAffixFields omits cleared values from public StyleOptions', () => {
    expect(
      toPublicSeriesLabelAffixFields({
        backgroundColor: null,
        padding: null,
        borderColor: null,
        borderWidth: null,
        borderRadius: null,
      }),
    ).toEqual({});
  });

  it('toPublicSeriesLabelAffixFields keeps set values', () => {
    expect(
      toPublicSeriesLabelAffixFields({
        backgroundColor: '#00bcd4',
        padding: 6,
        borderColor: '#333333',
        borderWidth: 2,
        borderRadius: 4,
        prefix: 'P:',
        suffix: '%',
      }),
    ).toEqual({
      backgroundColor: '#00bcd4',
      padding: 6,
      borderColor: '#333333',
      borderWidth: 2,
      borderRadius: 4,
      prefix: 'P:',
      suffix: '%',
    });
  });

  it('toPublicSeriesLabelAffixFields keeps numeric fields when colors are cleared independently', () => {
    expect(
      toPublicSeriesLabelAffixFields(
        extractSeriesLabelAffixFromFusion({
          backgroundColor: null,
          backgroundPadding: 6,
          borderColor: null,
          borderWidth: 3,
          borderRadius: 8,
        }),
      ),
    ).toEqual({
      padding: 6,
      borderWidth: 3,
      borderRadius: 8,
    });
  });
});
