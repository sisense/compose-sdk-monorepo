import { describe, expect, it } from 'vitest';

import {
  extractSeriesLabelAffixFromFusion,
  extractSeriesLabelTextStyleFromFusion,
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

  it('extractSeriesLabelTextStyleFromFusion returns null for explicit color clear', () => {
    expect(extractSeriesLabelTextStyleFromFusion({ color: null })).toBeNull();
  });

  it('extractSeriesLabelTextStyleFromFusion maps color', () => {
    expect(extractSeriesLabelTextStyleFromFusion({ color: '#ff0000' })).toEqual({
      color: '#ff0000',
    });
  });

  it('extractSeriesLabelTextStyleFromFusion preserves fontSize when color is explicitly cleared', () => {
    expect(extractSeriesLabelTextStyleFromFusion({ color: null, fontSize: 16 })).toEqual({
      fontSize: '16px',
    });
  });

  it('extractSeriesLabelTextStyleFromFusion preserves fontSize and fontStyle when color is explicitly cleared', () => {
    expect(
      extractSeriesLabelTextStyleFromFusion({ color: null, fontSize: 16, fontStyle: 'italic' }),
    ).toEqual({
      fontSize: '16px',
      fontStyle: 'italic',
    });
  });

  it('extractSeriesLabelTextStyleFromFusion treats standalone fontSize null as unset', () => {
    expect(extractSeriesLabelTextStyleFromFusion({ fontSize: null })).toBeUndefined();
  });

  it('extractSeriesLabelTextStyleFromFusion treats standalone fontStyle reset as unset', () => {
    expect(extractSeriesLabelTextStyleFromFusion({ fontStyle: null })).toBeUndefined();
    expect(extractSeriesLabelTextStyleFromFusion({ fontStyle: 'normal' })).toBeUndefined();
  });

  it('extractSeriesLabelTextStyleFromFusion preserves fontSize when only fontStyle is reset', () => {
    expect(extractSeriesLabelTextStyleFromFusion({ fontSize: 16, fontStyle: 'normal' })).toEqual({
      fontSize: '16px',
    });
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
