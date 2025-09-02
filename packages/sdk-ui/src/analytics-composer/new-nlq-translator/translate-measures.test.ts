import { describe, it, expect } from 'vitest';
import {
  translateMeasuresJSON,
  translateMeasuresFromJSONFunctionCall,
} from './translate-measures.js';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { ParsedFunctionCall } from './common.js';

describe('translateMeasures', () => {
  describe('translateMeasuresFromJSONFunctionCall', () => {
    it('should translate measures from parsed function calls', () => {
      const mockMeasuresJSON: ParsedFunctionCall[] = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        { function: 'measureFactory.count', args: ['DM.Commerce.Revenue', 'Revenue Count'] },
      ];

      const measures = translateMeasuresFromJSONFunctionCall(
        mockMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(measures).toHaveLength(2);
      expect(measures).toMatchSnapshot();
    });

    it('should translate single measure', () => {
      const mockMeasuresJSON: ParsedFunctionCall[] = [
        { function: 'measureFactory.average', args: ['DM.Commerce.Revenue'] },
      ];

      const measures = translateMeasuresFromJSONFunctionCall(
        mockMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(measures).toHaveLength(1);
      expect(measures).toMatchSnapshot();
    });

    it('should throw error when trying to use filter function as measure', () => {
      const mockMeasuresJSON: ParsedFunctionCall[] = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
      ];

      expect(() => {
        translateMeasuresFromJSONFunctionCall(
          mockMeasuresJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        );
      }).toThrow('Invalid measure JSON');
    });

    it('should throw error when trying to use filter relation as measure', () => {
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

      expect(() => {
        translateMeasuresFromJSONFunctionCall(
          mockMeasuresJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        );
      }).toThrow('Invalid measure JSON');
    });
  });

  describe('translateMeasuresFromJSON', () => {
    it('should return empty array when measuresJSON is null', () => {
      const measures = translateMeasuresJSON(
        null as any,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(measures).toEqual([]);
    });

    it('should return empty array when measuresJSON is undefined', () => {
      const measures = translateMeasuresJSON(
        undefined as any,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(measures).toEqual([]);
    });

    it('should return empty array when measuresJSON is false', () => {
      const measures = translateMeasuresJSON(
        false as any,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(measures).toEqual([]);
    });

    it('should return empty array when measuresJSON is 0', () => {
      const measures = translateMeasuresJSON(
        0 as any,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(measures).toEqual([]);
    });

    it('should return empty array when measuresJSON is empty string', () => {
      const measures = translateMeasuresJSON(
        '' as any,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(measures).toEqual([]);
    });

    it('should translate empty array to empty array', () => {
      const measures = translateMeasuresJSON(
        [],
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(measures).toEqual([]);
    });

    it('should throw error for array of strings instead of function calls', () => {
      const invalidMeasuresJSON = ['DM.Commerce.Revenue', 'DM.Commerce.Cost'] as any;

      expect(() => {
        translateMeasuresJSON(
          invalidMeasuresJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        );
      }).toThrow(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should throw error for array of objects missing function property', () => {
      const invalidMeasuresJSON = [{ args: ['DM.Commerce.Revenue', 'Total Revenue'] }] as any;

      expect(() => {
        translateMeasuresJSON(
          invalidMeasuresJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        );
      }).toThrow(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should throw error for array of objects missing args property', () => {
      const invalidMeasuresJSON = [{ function: 'measureFactory.sum' }] as any;

      expect(() => {
        translateMeasuresJSON(
          invalidMeasuresJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        );
      }).toThrow(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should throw error for array containing non-objects', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        'not an object',
      ] as any;

      expect(() => {
        translateMeasuresJSON(
          invalidMeasuresJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        );
      }).toThrow(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should throw error for array containing null values', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        null,
      ] as any;

      expect(() => {
        translateMeasuresJSON(
          invalidMeasuresJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        );
      }).toThrow(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should throw error for array containing boolean values', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        true,
      ] as any;

      expect(() => {
        translateMeasuresJSON(
          invalidMeasuresJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        );
      }).toThrow(
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should translate valid parsed function call array', () => {
      const validMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        { function: 'measureFactory.count', args: ['DM.Commerce.Revenue'] },
      ];

      const measures = translateMeasuresJSON(
        validMeasuresJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(Array.isArray(measures)).toBe(true);
      expect(measures).toHaveLength(2);
    });
  });
});
