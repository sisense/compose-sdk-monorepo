import { attributeFactory, createAttribute, measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  inferCalculatedDimensionDataType,
  resolveCalculatedDimensionDataType,
} from './infer-calculated-dimension-type.js';

const text = createAttribute({ name: 'Gender', type: 'text-attribute', expression: '[C.Gender]' });
const numeric = createAttribute({
  name: 'Cost',
  type: 'numeric-attribute',
  expression: '[C.Cost]',
});

describe('inferCalculatedDimensionDataType', () => {
  it('takes the type of a bare column reference', () => {
    expect(inferCalculatedDimensionDataType('[A]', { '[A]': numeric })).toBe('numeric');
    expect(inferCalculatedDimensionDataType(' [A] ', { '[A]': text })).toBe('text');
  });

  it('takes the type of a nested calculated dimension', () => {
    const nested = attributeFactory.customFormula('n', '[A]', { A: numeric }, 'numeric');
    expect(inferCalculatedDimensionDataType('[N]', { '[N]': nested })).toBe('numeric');
  });

  it('reads a measure as numeric', () => {
    expect(inferCalculatedDimensionDataType('[M]', { '[M]': measureFactory.sum(numeric) })).toBe(
      'numeric',
    );
  });

  it('takes the shared type of CASE results', () => {
    const ctx = { '[A]': numeric };
    expect(inferCalculatedDimensionDataType('CASE WHEN [A] > 1 THEN 100 ELSE 5 END', ctx)).toBe(
      'numeric',
    );
    expect(
      inferCalculatedDimensionDataType("CASE WHEN [A] > 1 THEN 'big' ELSE 'small' END", ctx),
    ).toBe('text');
    expect(inferCalculatedDimensionDataType('case when [A] > 1 then [A] else 0 end', ctx)).toBe(
      'numeric',
    );
  });

  it('ignores CASE keywords inside quoted strings', () => {
    const ctx = { '[A]': text };
    expect(
      inferCalculatedDimensionDataType(
        `CASE WHEN [A] = "THEN 'x' ELSE 'y' END" THEN 1 ELSE 2 END`,
        ctx,
      ),
    ).toBe('numeric');
    expect(
      inferCalculatedDimensionDataType("CASE WHEN [A] = 'case' THEN 'a' ELSE 'b' END", ctx),
    ).toBe('text');
  });

  it('leaves the type open when the formula does not decide it', () => {
    const ctx = { '[A]': numeric, '[B]': text };
    expect(
      inferCalculatedDimensionDataType("CASE WHEN [A] > 1 THEN 1 ELSE 'x' END", ctx),
    ).toBeUndefined();
    expect(inferCalculatedDimensionDataType('Concat([A], [B])', ctx)).toBeUndefined();
    expect(
      inferCalculatedDimensionDataType("LEN(CASE WHEN [A] > 1 THEN 'x' ELSE 'y' END)", ctx),
    ).toBeUndefined();
    expect(
      inferCalculatedDimensionDataType("CASE WHEN [A] > 1 THEN 'x' ELSE 'y' END = 'x'", ctx),
    ).toBeUndefined();
    expect(
      inferCalculatedDimensionDataType("CASE WHEN [A] > 1 THEN LEN([B]) ELSE 'x' END", ctx),
    ).toBeUndefined();
    expect(
      inferCalculatedDimensionDataType('CASE WHEN [A] > 1 THEN [A] + 1 ELSE 0 END', ctx),
    ).toBeUndefined();
  });
});

describe('resolveCalculatedDimensionDataType', () => {
  it('prefers the inferred type over a wrong given one', () => {
    expect(resolveCalculatedDimensionDataType('[A]', { '[A]': numeric }, 'text')).toBe('numeric');
  });

  it('uses a valid given type when the formula does not decide it', () => {
    expect(resolveCalculatedDimensionDataType('Left([A], 1)', { '[A]': text }, 'numeric')).toBe(
      'numeric',
    );
  });

  it('drops an invalid given type', () => {
    expect(
      resolveCalculatedDimensionDataType('Left([A], 1)', { '[A]': text }, 'number'),
    ).toBeUndefined();
  });
});
