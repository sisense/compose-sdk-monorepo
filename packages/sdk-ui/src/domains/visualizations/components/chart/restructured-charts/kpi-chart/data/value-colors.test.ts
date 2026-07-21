import { ConditionalDataColorOptions, StyledMeasureColumn } from '@/types';

import { resolveComparisonColor, resolveValueColor } from './value-colors';

/** Shared measure-column fixture: `MeasureColumn`'s only required field is `name`, so this needs no cast. */
function styledMeasure(overrides: Partial<StyledMeasureColumn> = {}): StyledMeasureColumn {
  return {
    column: { name: 'Revenue', title: 'Revenue' },
    ...overrides,
  };
}

describe('resolveValueColor', () => {
  const greenAbove100: ConditionalDataColorOptions = {
    type: 'conditional',
    conditions: [{ color: '#00ff00', expression: '100', operator: '>' }],
    defaultColor: '#ff0000',
  };

  it('resolves a conditional color from the measure color options', () => {
    const measure = styledMeasure({ color: greenAbove100 });

    expect(resolveValueColor(measure, 150)).toBe('#00ff00');
    expect(resolveValueColor(measure, 50)).toBe('#ff0000');
  });

  it('resolves a uniform color string', () => {
    const measure = styledMeasure({ color: '#123456' });

    expect(resolveValueColor(measure, 42)).toBe('#123456');
  });

  it('resolves a uniform color object', () => {
    const measure = styledMeasure({ color: { type: 'uniform', color: '#654321' } });

    expect(resolveValueColor(measure, 42)).toBe('#654321');
  });

  it('leaves the color undefined without color options', () => {
    const measure = styledMeasure();

    expect(resolveValueColor(measure, 42)).toBeUndefined();
  });

  it('leaves the color undefined when the value is undefined', () => {
    const measure = styledMeasure({ color: greenAbove100 });

    expect(resolveValueColor(measure, undefined)).toBeUndefined();
  });

  it('range coloring is not applicable to a single KPI value and resolves to undefined', () => {
    const measure = styledMeasure({
      color: { type: 'range', minColor: '#ff0000', maxColor: '#00ff00' },
    });

    expect(resolveValueColor(measure, 42)).toBeUndefined();
  });
});

describe('resolveComparisonColor', () => {
  it('returns undefined when metric is undefined (baseline=0 rule)', () => {
    expect(resolveComparisonColor(undefined, undefined)).toBeUndefined();
    expect(
      resolveComparisonColor({ type: 'uniform', color: '#123456' }, undefined),
    ).toBeUndefined();
  });

  it('applies conditional options against the metric', () => {
    expect(
      resolveComparisonColor(
        { type: 'conditional', conditions: [{ color: 'green', expression: '0', operator: '>' }] },
        12.5,
      ),
    ).toBe('green');
  });

  it('applies conditional options and falls back to defaultColor when no condition matches', () => {
    expect(
      resolveComparisonColor(
        {
          type: 'conditional',
          conditions: [{ color: 'green', expression: '0', operator: '>' }],
          defaultColor: 'gray',
        },
        -5,
      ),
    ).toBe('gray');
  });

  it('falls back to sign-based default without options: positive → green', () => {
    expect(resolveComparisonColor(undefined, 12.5)).toBe('#4CAF50');
  });

  it('falls back to sign-based default without options: negative → red', () => {
    expect(resolveComparisonColor(undefined, -3.2)).toBe('#E53935');
  });

  it('falls back to sign-based default without options: zero → undefined', () => {
    expect(resolveComparisonColor(undefined, 0)).toBeUndefined();
  });

  it('supports a plain color string option', () => {
    expect(resolveComparisonColor('#abcdef', 12.5)).toBe('#abcdef');
  });

  it('supports uniform color options', () => {
    expect(resolveComparisonColor({ type: 'uniform', color: '#fedcba' }, -8)).toBe('#fedcba');
  });

  it('range coloring is not applicable to a single comparison metric and resolves to undefined (matches resolveValueColor)', () => {
    const color = resolveComparisonColor(
      { type: 'range', minColor: '#000000', maxColor: '#ffffff' },
      50,
    );
    expect(color).toBeUndefined();
  });
});
