import { describe, expect, it } from 'vitest';

import { numberFormatConfigToNumericMask } from './number-format-config-to-numeric-mask.js';

describe('numberFormatConfigToNumericMask', () => {
  it('maps a basic numbers config to a Fusion numeric mask', () => {
    expect(
      numberFormatConfigToNumericMask({
        name: 'Numbers',
        million: false,
        billion: false,
        trillion: false,
        kilo: false,
        decimalScale: 2,
        thousandSeparator: true,
      }),
    ).toEqual({
      type: 'number',
      abbreviations: { k: false, m: false, b: false, t: false },
      abbreviateAll: false,
      decimals: 2,
      isdefault: true,
      number: { separated: true },
      separated: true,
    });
  });

  it('maps abbreviation flags to mask abbreviations', () => {
    expect(
      numberFormatConfigToNumericMask({
        name: 'Numbers',
        kilo: true,
        million: true,
        billion: true,
        trillion: true,
        thousandSeparator: false,
      }),
    ).toEqual({
      type: 'number',
      abbreviations: { k: true, m: true, b: true, t: true },
      abbreviateAll: false,
      decimals: 'auto',
      isdefault: true,
      number: { separated: false },
      separated: false,
    });
  });

  it('maps percent config to a percent Fusion mask', () => {
    expect(
      numberFormatConfigToNumericMask({
        name: 'Percent',
        decimalScale: 1,
      }),
    ).toEqual({
      type: 'percent',
      percent: true,
      abbreviations: { k: true, m: true, b: true, t: true },
      abbreviateAll: false,
      decimals: 1,
      isdefault: true,
      number: { separated: true },
      separated: true,
    });
  });

  it('maps currency config with prefix symbol position', () => {
    expect(
      numberFormatConfigToNumericMask({
        name: 'Currency',
        symbol: '$',
        prefix: true,
        decimalScale: 0,
        thousandSeparator: true,
      }),
    ).toEqual({
      type: 'number',
      abbreviations: { k: true, m: true, b: true, t: true },
      abbreviateAll: false,
      decimals: 0,
      isdefault: true,
      number: { separated: true },
      separated: true,
      currency: { symbol: '$', position: 'pre' },
    });
  });

  it('maps currency config with postfix symbol position', () => {
    expect(
      numberFormatConfigToNumericMask({
        name: 'Currency',
        symbol: '€',
        prefix: false,
      }),
    ).toEqual({
      type: 'number',
      abbreviations: { k: true, m: true, b: true, t: true },
      abbreviateAll: false,
      decimals: 'auto',
      isdefault: true,
      number: { separated: true },
      separated: true,
      currency: { symbol: '€', position: 'post' },
    });
  });

  it('fills defaults from getCompleteNumberFormatConfig when config is partial', () => {
    expect(numberFormatConfigToNumericMask({ kilo: false })).toEqual({
      type: 'number',
      abbreviations: { k: false, m: true, b: true, t: true },
      abbreviateAll: false,
      decimals: 'auto',
      isdefault: true,
      number: { separated: true },
      separated: true,
    });
  });
});
