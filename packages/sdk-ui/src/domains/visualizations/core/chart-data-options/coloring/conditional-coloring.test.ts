import { ConditionalDataColorOptions } from '../../../../../types';
import { getConditionalColoringFunction } from './conditional-coloring';

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
