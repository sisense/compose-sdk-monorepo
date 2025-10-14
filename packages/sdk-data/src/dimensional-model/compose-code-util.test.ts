import { DimensionalAttribute } from './attributes.js';
import { stringifyHelper } from './compose-code-utils.js';
import * as filterFactory from './filters/factory.js';

describe('stringifyHelper', () => {
  it('should stringify random argument', () => {
    const arg = { foo: 'bar' };
    const result = stringifyHelper(arg);
    expect(result).toBe(`{ foo: 'bar' }`);
  });

  it('should stringify common argument', () => {
    const arg = new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'text-attribute');
    const result = stringifyHelper(arg);
    expect(result).toBe('DM.Commerce.AgeRange');
  });

  it('should stringify null', () => {
    const arg = null;
    const result = stringifyHelper(arg);
    expect(result).toBe('null');
  });

  it('should stringify undefined', () => {
    const arg = undefined;
    const result = stringifyHelper(arg);
    expect(result).toBe('undefined');
  });

  it('should stringify object with composeCode', () => {
    const arg = { someProp: { foo: 'bar', composeCode: 'some code' } };
    const result = stringifyHelper(arg);
    expect(result).toBe('{ someProp: some code }');
  });

  it('should stringify object with nested class instance', () => {
    const backgroundFilter = filterFactory.members(
      new DimensionalAttribute('Country', '[Country.Country]', 'text-attribute'),
      ['United States'],
      { excludeMembers: true, deactivatedMembers: ['China', 'Russia'] },
    );
    const arg = { backgroundFilter };

    const result = stringifyHelper(arg);
    expect(result).toBe(
      `{ backgroundFilter: filterFactory.members(DM.Country.Country, ['United States'], { excludeMembers: true, deactivatedMembers: ['China', 'Russia'] }) }`,
    );
  });

  // Add more test cases as needed
});
