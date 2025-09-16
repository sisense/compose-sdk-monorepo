import { describe, it, expect } from 'vitest';
import {
  translateFiltersFromJSONFunctionCall,
  translateFiltersJSON,
  translateHighlightsFromJSONFunctionCall,
} from './translate-filters.js';
import { isFilterRelations, withoutGuids, JSONArray } from '@sisense/sdk-data';
import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { ParsedFunctionCall } from './common.js';
import { NlqTranslationResult } from '../types.js';

function getSuccessData<T>(result: NlqTranslationResult<T>): T {
  if (!result.success) throw new Error('Expected success result');
  return result.data;
}

function getErrors<T>(result: NlqTranslationResult<T>): string[] {
  if (result.success) throw new Error('Expected error result');
  return result.errors;
}

describe('translateFilters', () => {
  it('should translate filter relations', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      {
        function: 'filterFactory.logic.and',
        args: [
          {
            function: 'filterFactory.logic.or',
            args: [
              {
                function: 'filterFactory.members',
                args: ['DM.Country.Country', ['United States', 'Canada']],
              },
              {
                function: 'filterFactory.members',
                args: ['DM.Brand.Brand', ['Brand A', 'Brand B']],
              },
            ],
          },
          {
            function: 'filterFactory.measureGreaterThan',
            args: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] }, 1000],
          },
        ],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(isFilterRelations(data)).toBe(true);
    expect(withoutGuids(data)).toMatchSnapshot();
  });

  it('should translate filters', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
      { function: 'filterFactory.members', args: ['DM.Commerce.Date.Years', ['2024', '2025']] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(isFilterRelations(data)).toBe(false);
    expect(withoutGuids(data)).toMatchSnapshot();
  });

  it('should return error for nonexistent filterFactory function', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'filterFactory.nonexistentFunction', args: ['DM.Country.Country', 'test'] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Function "filterFactory.nonexistentFunction" not found in filterFactory or measureFactory.',
    );
  });

  it('should return error for nonexistent measureFactory function', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      {
        function: 'filterFactory.measureGreaterThan',
        args: [
          { function: 'measureFactory.nonexistentFunction', args: ['DM.Commerce.Revenue'] },
          1000,
        ],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Function "measureFactory.nonexistentFunction" not found in filterFactory or measureFactory.',
    );
  });

  it('should return error for completely invalid factory name', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'invalidFactory.someFunction', args: ['DM.Country.Country', 'test'] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Function "invalidFactory.someFunction" not found in filterFactory or measureFactory.',
    );
  });

  it('should return error for function path without factory prefix', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'members', args: ['DM.Country.Country', ['United States']] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Function "members" not found in filterFactory or measureFactory.',
    );
  });

  it('should return error for attribute name with insufficient parts after DM', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'filterFactory.members', args: ['DM.Country', ['United States']] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Invalid attribute name format: "DM.Country". Expected format: "DM.TableName.ColumnName[.Level]".',
    );
  });

  it('should return error for attribute name with only DM prefix', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'filterFactory.members', args: ['DM.', ['United States']] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Invalid attribute name format: "DM.". Expected format: "DM.TableName.ColumnName[.Level]".',
    );
  });

  it('should return error for nonexistent table name', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.NonExistentTable.SomeColumn', ['test']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('Table "NonExistentTable" not found in the data model.');
  });

  it('should return error for nonexistent column name', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.Country.NonExistentColumn', ['test']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Column "NonExistentColumn" not found in table "Country".',
    );
  });

  it('should return error for date level on non-datetime column', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.Country.Country.Years', ['2024']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Invalid date level "Years" in attribute "DM.Country.Country.Years". Column "Country.Country" is not a datetime column.',
    );
  });

  it('should return error for invalid date level on datetime column', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.Commerce.Date.InvalidLevel', ['2024']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      'Invalid date level "InvalidLevel" in attribute "DM.Commerce.Date.InvalidLevel".',
    );
  });

  it('should return error when trying to use measure function as top-level filter', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('Invalid filter JSON');
  });

  it('should return error when trying to use measure function with title as top-level filter', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'measureFactory.count', args: ['DM.Commerce.Revenue', 'Revenue Count'] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('Invalid filter JSON');
  });

  it('should return error when trying to use average measure as top-level filter', () => {
    const mockFiltersJSON: ParsedFunctionCall[] = [
      { function: 'measureFactory.average', args: ['DM.Commerce.Revenue'] },
    ];

    const result = translateFiltersFromJSONFunctionCall(
      mockFiltersJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('Invalid filter JSON');
  });

  describe('translateFiltersFromJSON', () => {
    it('should return empty array when filtersJSON is null', () => {
      const result = translateFiltersJSON(
        null as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when filtersJSON is undefined', () => {
      const result = translateFiltersJSON(
        undefined as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when filtersJSON is false', () => {
      const result = translateFiltersJSON(
        false as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when filtersJSON is 0', () => {
      const result = translateFiltersJSON(
        0 as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when filtersJSON is empty string', () => {
      const result = translateFiltersJSON(
        '' as unknown as JSONArray,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should translate empty array to empty array', () => {
      const result = translateFiltersJSON(
        [],
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return error for array of strings instead of function calls', () => {
      const invalidFiltersJSON = ['DM.Country.Country', 'DM.Brand.Brand'] as unknown as JSONArray;

      const result = translateFiltersJSON(
        invalidFiltersJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid filters JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array of objects missing function property', () => {
      const invalidFiltersJSON = [
        { args: ['DM.Country.Country', ['United States']] },
      ] as unknown as JSONArray;

      const result = translateFiltersJSON(
        invalidFiltersJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid filters JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array of objects missing args property', () => {
      const invalidFiltersJSON = [{ function: 'filterFactory.members' }] as unknown as JSONArray;

      const result = translateFiltersJSON(
        invalidFiltersJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid filters JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array containing non-objects', () => {
      const invalidFiltersJSON = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
        'not an object',
      ] as unknown as JSONArray;

      const result = translateFiltersJSON(
        invalidFiltersJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid filters JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should return error for array containing null values', () => {
      const invalidFiltersJSON = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
        null,
      ] as unknown as JSONArray;

      const result = translateFiltersJSON(
        invalidFiltersJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        'Invalid filters JSON. Expected an array of function calls with "function" and "args" properties.',
      );
    });

    it('should translate valid parsed function call array', () => {
      const validFiltersJSON = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
      ];

      const result = translateFiltersJSON(
        validFiltersJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
    });
  });

  describe('translateHighlightsFromJSONFunctionCall', () => {
    it('should translate highlights from parsed function calls', () => {
      const mockHighlightsJSON: ParsedFunctionCall[] = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
        { function: 'filterFactory.members', args: ['DM.Brand.Brand', ['Brand A']] },
      ];

      const result = translateHighlightsFromJSONFunctionCall(
        mockHighlightsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(data).toHaveLength(2);
      expect(withoutGuids(data)).toMatchSnapshot();
    });

    it('should return error when trying to use measure function as highlight', () => {
      const mockHighlightsJSON: ParsedFunctionCall[] = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
      ];

      const result = translateHighlightsFromJSONFunctionCall(
        mockHighlightsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Invalid filter JSON');
    });

    it('should return error when trying to use filter relation as highlight', () => {
      const mockHighlightsJSON: ParsedFunctionCall[] = [
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

      const result = translateHighlightsFromJSONFunctionCall(
        mockHighlightsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Invalid filter JSON');
    });

    it('should return error when trying to use average measure as highlight', () => {
      const mockHighlightsJSON: ParsedFunctionCall[] = [
        { function: 'measureFactory.average', args: ['DM.Commerce.Revenue'] },
      ];

      const result = translateHighlightsFromJSONFunctionCall(
        mockHighlightsJSON,
        MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      );

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Invalid filter JSON');
    });
  });
});
