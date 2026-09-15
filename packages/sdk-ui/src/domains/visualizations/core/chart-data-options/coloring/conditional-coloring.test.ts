import { Measure } from '@sisense/sdk-data';

import { ConditionalDataColorOptions } from '../../../../../types';
import {
  getColorConditionMeasures,
  getConditionalColoringFunction,
  withResolvedConditionValues,
} from './conditional-coloring';

// Minimal fixture: only `name` is read by the code under test, so a full `Measure` is unnecessary.
const targetMeasure = { name: 'Target' } as unknown as Measure;

describe('getConditionalColoringFunction', () => {
  it('should return a function that returns the color based on the conditions', () => {
    const colorOpts: ConditionalDataColorOptions = {
      type: 'conditional',
      conditions: [
        {
          color: 'red',
          expression: '50',
          operator: '<',
        },
        {
          color: 'green',
          expression: '50',
          operator: '>=',
        },
      ],
      defaultColor: 'blue',
    };

    const coloringFunction = getConditionalColoringFunction(colorOpts);

    expect(coloringFunction(25)).toBe('red');
    expect(coloringFunction(50)).toBe('green');
    expect(coloringFunction(75)).toBe('green');
    expect(coloringFunction(100)).toBe('green');
  });

  it('should return the default color when no conditions are met', () => {
    const colorOpts: ConditionalDataColorOptions = {
      type: 'conditional',
      conditions: [
        {
          color: 'red',
          expression: '50',
          operator: '<',
        },
      ],
      defaultColor: 'blue',
    };

    const coloringFunction = getConditionalColoringFunction(colorOpts);

    expect(coloringFunction(75)).toBe('blue');
    expect(coloringFunction(100)).toBe('blue');
    expect(coloringFunction(0)).toBe('red');
  });

  it('should return the default color when no conditions are provided', () => {
    const colorOpts: ConditionalDataColorOptions = {
      type: 'conditional',
      defaultColor: 'blue',
    };

    const coloringFunction = getConditionalColoringFunction(colorOpts);

    expect(coloringFunction(25)).toBe('blue');
    expect(coloringFunction(50)).toBe('blue');
    expect(coloringFunction(75)).toBe('blue');
  });
});

describe('withResolvedConditionValues', () => {
  const colorOpts: ConditionalDataColorOptions = {
    type: 'conditional',
    conditions: [
      { color: 'red', expression: '50', operator: '<' },
      { color: 'green', expression: '', operator: '>=', valueMeasure: targetMeasure },
    ],
    defaultColor: 'blue',
  };

  it('substitutes the resolved value for conditions with a valueMeasure', () => {
    const resolved = withResolvedConditionValues({
      Target: 30,
    })(colorOpts) as ConditionalDataColorOptions;

    expect(resolved.conditions).toEqual([
      { color: 'red', expression: '50', operator: '<' },
      { color: 'green', expression: '30', operator: '>=', valueMeasure: targetMeasure },
    ]);
  });

  it('drops a formula-driven condition whose value has not been resolved', () => {
    const resolved = withResolvedConditionValues(undefined)(
      colorOpts,
    ) as ConditionalDataColorOptions;

    expect(resolved.conditions).toEqual([{ color: 'red', expression: '50', operator: '<' }]);
  });

  it('leaves non-conditional color options unchanged', () => {
    const uniform = { type: 'uniform', color: 'red' } as const;
    expect(withResolvedConditionValues({ Target: 30 })(uniform)).toBe(uniform);
  });
});

describe('getColorConditionMeasures', () => {
  const formulaDriven: ConditionalDataColorOptions = {
    type: 'conditional',
    conditions: [
      { color: 'green', expression: '', operator: '>', valueMeasure: targetMeasure },
      { color: 'blue', expression: '10', operator: '<' },
    ],
    defaultColor: 'gray',
  };

  it('returns only the measures backing formula-driven conditions', () => {
    expect(getColorConditionMeasures(formulaDriven)).toEqual([{ column: targetMeasure }]);
  });

  it('returns nothing for conditions with literal thresholds', () => {
    expect(
      getColorConditionMeasures({
        type: 'conditional',
        conditions: [{ color: 'blue', expression: '10', operator: '<' }],
        defaultColor: 'gray',
      }),
    ).toEqual([]);
  });

  it('returns nothing for non-conditional color options', () => {
    expect(getColorConditionMeasures(undefined)).toEqual([]);
    expect(getColorConditionMeasures('red')).toEqual([]);
    expect(getColorConditionMeasures({ type: 'uniform', color: 'red' })).toEqual([]);
    expect(getColorConditionMeasures({ type: 'range', minColor: 'a', maxColor: 'b' })).toEqual([]);
  });

  it('tolerates conditional options with no conditions at all', () => {
    expect(getColorConditionMeasures({ type: 'conditional', defaultColor: 'gray' })).toEqual([]);
  });
});
