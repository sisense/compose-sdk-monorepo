import { JSONArray } from '@sisense/sdk-data';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { getErrors, getSuccessData } from './common.js';
import { translateDimensionsJSON } from './translate-dimensions.js';

describe('translateDimensions', () => {
  it('should translate dimensions from JSON array of strings', () => {
    const mockDimensionsJSON = ['DM.Country.Country', 'DM.Brand.Brand', 'DM.Category.Category'];

    const result = translateDimensionsJSON({
      data: mockDimensionsJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data).toHaveLength(3);
    expect(data).toMatchSnapshot();
  });

  it('should translate dimensions with date levels', () => {
    const mockDimensionsJSON = ['DM.Commerce.Date.Years', 'DM.Commerce.Date.Months'];

    const result = translateDimensionsJSON({
      data: mockDimensionsJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data).toHaveLength(2);
    expect(data).toMatchSnapshot();
  });

  it('should return empty array when dimensionsJSON is null', () => {
    const result = translateDimensionsJSON({
      data: null as unknown as JSONArray,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is undefined', () => {
    const result = translateDimensionsJSON({
      data: undefined as unknown as JSONArray,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is false', () => {
    const result = translateDimensionsJSON({
      data: false as unknown as JSONArray,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is 0', () => {
    const result = translateDimensionsJSON({
      data: 0 as unknown as JSONArray,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is empty string', () => {
    const result = translateDimensionsJSON({
      data: '' as unknown as JSONArray,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should translate empty array to empty array', () => {
    const result = translateDimensionsJSON({
      data: [],
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return error for array containing non-string values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      123,
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON({
      data: mockDimensionsJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should return error for array containing object values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      { invalid: 'object' },
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON({
      data: mockDimensionsJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should return error for array containing null values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      null,
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON({
      data: mockDimensionsJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should return error for array containing boolean values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      true,
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON({
      data: mockDimensionsJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should return error for array containing array values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      ['nested', 'array'],
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON({
      data: mockDimensionsJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });
});
