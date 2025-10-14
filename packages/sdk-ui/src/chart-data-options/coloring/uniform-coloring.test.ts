import { UniformDataColorOptions } from '../../types';
import { getUniformColoringFunction, getUniformColorOptionsFromString } from './uniform-coloring';

describe('getUniformColorOptionsFromString', () => {
  it('should return an object with the type "uniform" and the specified color', () => {
    const color = 'red';
    const expected: UniformDataColorOptions = {
      type: 'uniform',
      color: 'red',
    };

    const result = getUniformColorOptionsFromString(color);

    expect(result).toEqual(expected);
  });
});

describe('getUniformColoringFunction', () => {
  it('should return a function that returns the specified color', () => {
    const colorOpts: UniformDataColorOptions = {
      type: 'uniform',
      color: 'blue',
    };
    const expectedColor = 'blue';

    const coloringFunction = getUniformColoringFunction(colorOpts);
    const result = coloringFunction();

    expect(result).toBe(expectedColor);
  });
});
