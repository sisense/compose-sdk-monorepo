import { createAttribute } from '../../attributes.js';
import { stringifyHelper } from './filter-code-util.js';

describe('stringifyHelper', () => {
  it('should stringify random argument', () => {
    const arg = { foo: 'bar' };
    const result = stringifyHelper(arg);
    expect(result).toBe('{"foo":"bar"}');
  });

  it('should stringify common argument', () => {
    const arg = createAttribute({
      name: 'AgeRange',
      type: 'text-attribute',
      expression: '[Commerce.Age Range]',
    });
    arg.composeCode = 'some code';
    const result = stringifyHelper(arg);
    expect(result).toBe('some code');
  });

  it('should stringify null', () => {
    const arg = null;
    const result = stringifyHelper(arg);
    expect(result).toBe('null');
  });

  it('should stringify undefined', () => {
    const arg = undefined;
    const result = stringifyHelper(arg);
    expect(result).toBeUndefined();
  });

  // Add more test cases as needed
});
