import { describe, it, expect } from 'vitest';
import { translateDimensionsJSON } from './translate-dimensions.js';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';

describe('translateDimensions', () => {
  it('should translate dimensions from JSON array of strings', () => {
    const mockDimensionsJSON = ['DM.Country.Country', 'DM.Brand.Brand', 'DM.Category.Category'];

    const dimensions = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(dimensions).toHaveLength(3);
    expect(dimensions).toMatchSnapshot();
  });

  it('should translate dimensions with date levels', () => {
    const mockDimensionsJSON = ['DM.Commerce.Date.Years', 'DM.Commerce.Date.Months'];

    const dimensions = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(dimensions).toHaveLength(2);
    expect(dimensions).toMatchSnapshot();
  });

  it('should return empty array when dimensionsJSON is null', () => {
    const dimensions = translateDimensionsJSON(
      null as any,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(dimensions).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is undefined', () => {
    const dimensions = translateDimensionsJSON(
      undefined as any,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(dimensions).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is false', () => {
    const dimensions = translateDimensionsJSON(
      false as any,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(dimensions).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is 0', () => {
    const dimensions = translateDimensionsJSON(
      0 as any,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(dimensions).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is empty string', () => {
    const dimensions = translateDimensionsJSON(
      '' as any,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(dimensions).toEqual([]);
  });

  it('should translate empty array to empty array', () => {
    const dimensions = translateDimensionsJSON(
      [],
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(dimensions).toEqual([]);
  });

  it('should throw error for array containing non-string values', () => {
    const mockDimensionsJSON = ['DM.Country.Country', 123, 'DM.Brand.Brand'] as any;

    expect(() => {
      translateDimensionsJSON(
        mockDimensionsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
    }).toThrow('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should throw error for array containing object values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      { invalid: 'object' },
      'DM.Brand.Brand',
    ] as any;

    expect(() => {
      translateDimensionsJSON(
        mockDimensionsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
    }).toThrow('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should throw error for array containing null values', () => {
    const mockDimensionsJSON = ['DM.Country.Country', null, 'DM.Brand.Brand'] as any;

    expect(() => {
      translateDimensionsJSON(
        mockDimensionsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
    }).toThrow('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should throw error for array containing boolean values', () => {
    const mockDimensionsJSON = ['DM.Country.Country', true, 'DM.Brand.Brand'] as any;

    expect(() => {
      translateDimensionsJSON(
        mockDimensionsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
    }).toThrow('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should throw error for array containing array values', () => {
    const mockDimensionsJSON = ['DM.Country.Country', ['nested', 'array'], 'DM.Brand.Brand'] as any;

    expect(() => {
      translateDimensionsJSON(
        mockDimensionsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
    }).toThrow('Invalid dimensions JSON. Expected an array of strings.');
  });
});
