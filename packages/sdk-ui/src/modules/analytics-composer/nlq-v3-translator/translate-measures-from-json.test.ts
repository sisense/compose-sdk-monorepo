import { JSONArray } from '@sisense/sdk-data';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { createSchemaIndex, getErrors, getSuccessData } from './common.js';
import { translateMeasuresFromJSON } from './translate-measures-from-json.js';

const MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE = createSchemaIndex(
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
);

describe('translateMeasures', () => {
  describe('translateMeasuresFromJSON', () => {
    it('should return empty array when measuresJSON is null', () => {
      const result = translateMeasuresFromJSON({
        data: null as unknown as JSONArray,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is undefined', () => {
      const result = translateMeasuresFromJSON({
        data: undefined as unknown as JSONArray,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is false', () => {
      const result = translateMeasuresFromJSON({
        data: false as unknown as JSONArray,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is 0', () => {
      const result = translateMeasuresFromJSON({
        data: 0 as unknown as JSONArray,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is empty string', () => {
      const result = translateMeasuresFromJSON({
        data: '' as unknown as JSONArray,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should translate empty array to empty array', () => {
      const result = translateMeasuresFromJSON({
        data: [],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return error for array of strings instead of function calls', () => {
      const invalidMeasuresJSON = [
        'DM.Commerce.Revenue',
        'DM.Commerce.Cost',
      ] as unknown as JSONArray;

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measure item. Expected a function call (function/args) or object with "column" and optional "sortType".',
      );
    });

    it('should return error for array of objects missing function property', () => {
      const invalidMeasuresJSON = [
        { args: ['DM.Commerce.Revenue', 'Total Revenue'] },
      ] as unknown as JSONArray;

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measure item. Expected a function call (function/args) or object with "column" and optional "sortType".',
      );
    });

    it('should return error for array of objects missing args property', () => {
      const invalidMeasuresJSON = [{ function: 'measureFactory.sum' }] as unknown as JSONArray;

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measure item. Expected a function call (function/args) or object with "column" and optional "sortType".',
      );
    });

    it('should return error for array containing non-objects', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        'not an object',
      ] as unknown as JSONArray;

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measure item. Expected a function call (function/args) or object with "column" and optional "sortType".',
      );
    });

    it('should return error for array containing null values', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        null,
      ] as unknown as JSONArray;

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measure item. Expected a function call (function/args) or object with "column" and optional "sortType".',
      );
    });

    it('should return error for array containing boolean values', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        true,
      ] as unknown as JSONArray;

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measure item. Expected a function call (function/args) or object with "column" and optional "sortType".',
      );
    });

    it('should translate valid parsed function call array', () => {
      const validMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        { function: 'measureFactory.count', args: ['DM.Commerce.Revenue'] },
      ];

      const result = translateMeasuresFromJSON({
        data: validMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });
  });
});
