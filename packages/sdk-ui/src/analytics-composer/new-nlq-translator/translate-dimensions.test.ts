import { describe, it, expect } from 'vitest';
import { JSONArray } from '@ethings-os/sdk-data';
import { translateDimensionsJSON } from './translate-dimensions.js';
import { NlqTranslationResult } from '../types.js';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';

function getSuccessData<T>(result: NlqTranslationResult<T>): T {
  if (!result.success) throw new Error('Expected success result');
  return result.data;
}

function getErrors<T>(result: NlqTranslationResult<T>): string[] {
  if (result.success) throw new Error('Expected error result');
  return result.errors;
}

describe('translateDimensions', () => {
  it('should translate dimensions from JSON array of strings', () => {
    const mockDimensionsJSON = ['DM.Country.Country', 'DM.Brand.Brand', 'DM.Category.Category'];

    const result = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data).toHaveLength(3);
    expect(data).toMatchSnapshot();
  });

  it('should translate dimensions with date levels', () => {
    const mockDimensionsJSON = ['DM.Commerce.Date.Years', 'DM.Commerce.Date.Months'];

    const result = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data).toHaveLength(2);
    expect(data).toMatchSnapshot();
  });

  it('should return empty array when dimensionsJSON is null', () => {
    const result = translateDimensionsJSON(
      null as unknown as JSONArray,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is undefined', () => {
    const result = translateDimensionsJSON(
      undefined as unknown as JSONArray,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is false', () => {
    const result = translateDimensionsJSON(
      false as unknown as JSONArray,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is 0', () => {
    const result = translateDimensionsJSON(
      0 as unknown as JSONArray,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return empty array when dimensionsJSON is empty string', () => {
    const result = translateDimensionsJSON(
      '' as unknown as JSONArray,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should translate empty array to empty array', () => {
    const result = translateDimensionsJSON(
      [],
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(result.success).toBe(true);
    expect(getSuccessData(result)).toEqual([]);
  });

  it('should return error for array containing non-string values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      123,
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should return error for array containing object values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      { invalid: 'object' },
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should return error for array containing null values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      null,
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should return error for array containing boolean values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      true,
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });

  it('should return error for array containing array values', () => {
    const mockDimensionsJSON = [
      'DM.Country.Country',
      ['nested', 'array'],
      'DM.Brand.Brand',
    ] as unknown as JSONArray;

    const result = translateDimensionsJSON(
      mockDimensionsJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Invalid dimensions JSON. Expected an array of strings.');
  });
});
