import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { getFactoryFunctionsMap, validateLikelyAttribute } from './common.js';
import { MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE } from '../__mocks__/mock-data-sources.js';

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

describe('validateLikelyAttribute', () => {
  describe('strings that already have DM prefix', () => {
    it('should return true for strings that start with DM prefix', () => {
      const result = validateLikelyAttribute(
        'DM.Commerce.Revenue',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: true,
        suggestion: 'DM.Commerce.Revenue',
      });
    });

    it('should return true for strings with level that start with DM prefix', () => {
      const result = validateLikelyAttribute(
        'DM.Commerce.Date.Years',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: true,
        suggestion: 'DM.Commerce.Date.Years',
      });
    });
  });

  describe('2-part strings (table.column)', () => {
    it('should return true with suggestion for valid table.column combinations', () => {
      const result = validateLikelyAttribute(
        'Commerce.Revenue',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: true,
        suggestion: 'DM.Commerce.Revenue',
      });
    });

    it('should return true with suggestion for another valid table.column combination', () => {
      const result = validateLikelyAttribute(
        'Country.Country',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: true,
        suggestion: 'DM.Country.Country',
      });
    });

    it('should return false for non-existent table', () => {
      const result = validateLikelyAttribute(
        'NonExistent.Column',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });

    it('should return false for non-existent column', () => {
      const result = validateLikelyAttribute(
        'Commerce.NonExistentColumn',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });
  });

  describe('3-part strings (table.column.level)', () => {
    it('should return true with suggestion for valid datetime column with valid level', () => {
      const result = validateLikelyAttribute(
        'Commerce.Date.Years',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: true,
        suggestion: 'DM.Commerce.Date.Years',
      });
    });

    it('should return true with suggestion for datetime column with Months level', () => {
      const result = validateLikelyAttribute(
        'Commerce.Date.Months',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: true,
        suggestion: 'DM.Commerce.Date.Months',
      });
    });

    it('should return true with suggestion for datetime column with Days level', () => {
      const result = validateLikelyAttribute(
        'Commerce.Date.Days',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: true,
        suggestion: 'DM.Commerce.Date.Days',
      });
    });

    it('should return false for non-existent table in 3-part format', () => {
      const result = validateLikelyAttribute(
        'NonExistent.Date.Years',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });

    it('should return false for non-existent column in 3-part format', () => {
      const result = validateLikelyAttribute(
        'Commerce.NonExistentColumn.Years',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });

    it('should return false for non-datetime column with level', () => {
      const result = validateLikelyAttribute(
        'Commerce.Revenue.Years',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });

    it('should return false for datetime column with invalid level', () => {
      const result = validateLikelyAttribute(
        'Commerce.Date.InvalidLevel',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });
  });

  describe('edge cases', () => {
    it('should return false for single part string', () => {
      const result = validateLikelyAttribute('Commerce', MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE);
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });

    it('should return false for empty string', () => {
      const result = validateLikelyAttribute('', MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE);
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });

    it('should return false for 4+ part strings', () => {
      const result = validateLikelyAttribute(
        'Commerce.Date.Years.Extra',
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });

    it('should work with empty tables array', () => {
      const result = validateLikelyAttribute('Commerce.Revenue', []);
      expect(result).toEqual({
        isLikelyAttribute: false,
      });
    });
  });
});
