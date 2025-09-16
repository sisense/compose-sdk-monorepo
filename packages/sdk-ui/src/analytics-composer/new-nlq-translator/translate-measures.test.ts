import { describe, it, expect } from 'vitest';
import { JSONArray } from '@sisense/sdk-data';
import {
  translateMeasuresJSON,
  translateMeasuresFromJSONFunctionCall,
} from './translate-measures.js';
import { NlqTranslationResult } from '../types.js';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { ParsedFunctionCall } from './common.js';

function getSuccessData<T>(result: NlqTranslationResult<T>): T {
  if (!result.success) throw new Error('Expected success result');
  return result.data;
}

function getErrors<T>(result: NlqTranslationResult<T>): string[] {
  if (result.success) throw new Error('Expected error result');
  return result.errors;
}

describe('translateMeasures', () => {
  describe('translateMeasuresFromJSONFunctionCall', () => {
    it('should translate measures from parsed function calls', () => {
      const mockMeasuresJSON: ParsedFunctionCall[] = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        { function: 'measureFactory.count', args: ['DM.Commerce.Revenue', 'Revenue Count'] },
      ];

      const result = translateMeasuresFromJSONFunctionCall(
        mockMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(data).toHaveLength(2);
      expect(data).toMatchSnapshot();
    });

    it('should translate single measure', () => {
      const mockMeasuresJSON: ParsedFunctionCall[] = [
        { function: 'measureFactory.average', args: ['DM.Commerce.Revenue'] },
      ];

      const result = translateMeasuresFromJSONFunctionCall(
        mockMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(data).toHaveLength(1);
      expect(data).toMatchSnapshot();
    });

    it('should return error when trying to use filter function as measure', () => {
      const mockMeasuresJSON: ParsedFunctionCall[] = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
      ];

      const result = translateMeasuresFromJSONFunctionCall(
        mockMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Invalid measure JSON');
    });

    it('should return error when trying to use filter relation as measure', () => {
      const mockMeasuresJSON: ParsedFunctionCall[] = [
        {
          function: 'filterFactory.logic.and',
          args: [
            {
              function: 'filterFactory.members',
              args: ['DM.Country.Country', ['United States']],
            },
            {
              function: 'filterFactory.members',
              args: ['DM.Brand.Brand', ['Brand A']],
            },
          ],
        },
      ];

      const result = translateMeasuresFromJSONFunctionCall(
        mockMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Invalid measure JSON');
    });
  });

  describe('translateMeasuresFromJSON', () => {
    it('should return empty array when measuresJSON is null', () => {
      const result = translateMeasuresJSON(
        null as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is undefined', () => {
      const result = translateMeasuresJSON(
        undefined as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is false', () => {
      const result = translateMeasuresJSON(
        false as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is 0', () => {
      const result = translateMeasuresJSON(
        0 as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is empty string', () => {
      const result = translateMeasuresJSON(
        '' as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should translate empty array to empty array', () => {
      const result = translateMeasuresJSON(
        [],
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return error for array of strings instead of function calls', () => {
      const invalidMeasuresJSON = [
        'DM.Commerce.Revenue',
        'DM.Commerce.Cost',
      ] as unknown as JSONArray;

      const result = translateMeasuresJSON(
        invalidMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array of objects missing function property', () => {
      const invalidMeasuresJSON = [
        { args: ['DM.Commerce.Revenue', 'Total Revenue'] },
      ] as unknown as JSONArray;

      const result = translateMeasuresJSON(
        invalidMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array of objects missing args property', () => {
      const invalidMeasuresJSON = [{ function: 'measureFactory.sum' }] as unknown as JSONArray;

      const result = translateMeasuresJSON(
        invalidMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array containing non-objects', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        'not an object',
      ] as unknown as JSONArray;

      const result = translateMeasuresJSON(
        invalidMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array containing null values', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        null,
      ] as unknown as JSONArray;

      const result = translateMeasuresJSON(
        invalidMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array containing boolean values', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        true,
      ] as unknown as JSONArray;

      const result = translateMeasuresJSON(
        invalidMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should translate valid parsed function call array', () => {
      const validMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        { function: 'measureFactory.count', args: ['DM.Commerce.Revenue'] },
      ];

      const result = translateMeasuresJSON(
        validMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });
  });
});
