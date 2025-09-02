import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { getFactoryFunctionsMap } from './common.js';

describe('getFactoryFunctionsMap', () => {
  it('should get filter factory functions map', () => {
    const functionsMap = getFactoryFunctionsMap('filterFactory', filterFactory);
    [
      'filterFactory.logic.and',
      'filterFactory.logic.or',
      'filterFactory.members',
      'filterFactory.measureGreaterThan',
    ].forEach((key) => {
      expect(functionsMap).toHaveProperty(key);
    });
  });

  it('should get measure factory functions map', () => {
    const functionsMap = getFactoryFunctionsMap('measureFactory', measureFactory);
    [
      'measureFactory.sum',
      'measureFactory.count',
      'measureFactory.average',
      'measureFactory.min',
      'measureFactory.max',
      'measureFactory.median',
      'measureFactory.customFormula',
    ].forEach((key) => {
      expect(functionsMap).toHaveProperty(key);
    });
  });
});
