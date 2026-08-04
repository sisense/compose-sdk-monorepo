import {
  DateLevels,
  Filter,
  isFilterRelations,
  isLevelAttribute,
  isMembersFilter,
  withoutGuids,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../../__mocks__/mock-data-sources.js';
import { createSchemaIndex } from '../../shared/utils/schema-index.js';
import { getErrors, getSuccessData } from '../../shared/utils/translation-helpers.js';
import { flattenFilters } from '../../shared/validation/flatten-filters.js';
import { FunctionCall } from '../../types.js';
import {
  translateFiltersFromJSON,
  translateFiltersFromJSONFunctionCall,
  translateHighlightsFromJSONFunctionCall,
} from './translate-filters-from-json.js';

const MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE = createSchemaIndex(
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
);

describe('translateFilters', () => {
  it('should translate filter relations', () => {
    const mockFiltersJSON: FunctionCall[] = [
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

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(isFilterRelations(data)).toBe(true);
    expect(withoutGuids(data)).toMatchSnapshot();
  });

  it('should translate filters', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
      { function: 'filterFactory.members', args: ['DM.Commerce.Date.Years', ['2024', '2025']] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(isFilterRelations(data)).toBe(false);
    expect(withoutGuids(data)).toMatchSnapshot();
  });

  it.each([
    ['filterFactory.isEmpty', { equals: '', isEmpty: true }],
    ['filterFactory.isNotEmpty', { doesntEqual: '', isEmpty: true }],
  ] as const)('should translate %s to the expected emptiness JAQL', (fn, expectedFilterJaql) => {
    const result = translateFiltersFromJSONFunctionCall({
      data: [{ function: fn, args: ['DM.Commerce.Condition'] }],
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(isFilterRelations(data)).toBe(false);
    const [filter] = data as Filter[];
    expect(filter.jaql(true).filter).toEqual(expectedFilterJaql);
  });

  it('should return error for nonexistent filterFactory function', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'filterFactory.nonexistentFunction', args: ['DM.Country.Country', 'test'] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain("Unknown function 'filterFactory.nonexistentFunction'");
  });

  it('should return error for nonexistent measureFactory function', () => {
    const mockFiltersJSON: FunctionCall[] = [
      {
        function: 'filterFactory.measureGreaterThan',
        args: [
          { function: 'measureFactory.nonexistentFunction', args: ['DM.Commerce.Revenue'] },
          1000,
        ],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain("Unknown function 'measureFactory.nonexistentFunction'");
  });

  it('should suggest similar factory function when typo is close', () => {
    const mockFiltersJSON: FunctionCall[] = [
      {
        function: 'filterFactory.measureGreaterThan',
        args: [{ function: 'measureFactory.suum', args: ['DM.Commerce.Revenue'] }, 1000],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain("Did you mean 'measureFactory.sum'?");
  });

  it('should return error for completely invalid factory name', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'invalidFactory.someFunction', args: ['DM.Country.Country', 'test'] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain("Unknown function 'invalidFactory.someFunction'");
  });

  it('should return error for function path without factory prefix', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'members', args: ['DM.Country.Country', ['United States']] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain("Unknown function 'members'");
  });

  it('should return error for attribute name with insufficient parts after DM', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'filterFactory.members', args: ['DM.Country', ['United States']] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      "Invalid dimensional element name format: 'DM.Country'. Expected format: 'DM.TableName.ColumnName[.Level]'",
    );
  });

  it('should return error for attribute name with only DM prefix', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'filterFactory.members', args: ['DM.', ['United States']] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      "Invalid dimensional element name format: 'DM.'. Expected format: 'DM.TableName.ColumnName[.Level]'",
    );
  });

  it('should return error for nonexistent table name', () => {
    const mockFiltersJSON: FunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.NonExistentTable.SomeColumn', ['test']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain("Table 'NonExistentTable' not found in the data model");
  });

  it('should return error for nonexistent column name', () => {
    const mockFiltersJSON: FunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.Country.NonExistentColumn', ['test']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      "Column 'NonExistentColumn' not found in table 'Country'",
    );
  });

  it('should return error for date level on non-datetime column', () => {
    const mockFiltersJSON: FunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.Country.Country.Years', ['2024']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      "Invalid date level 'Years' in dimensional element 'DM.Country.Country.Years'. Column 'Country.Country' is not a datetime column",
    );
  });

  it('should return error for invalid date level on datetime column', () => {
    const mockFiltersJSON: FunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.Commerce.Date.InvalidLevel', ['2024']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      "Invalid date level 'InvalidLevel' in dimensional element 'DM.Commerce.Date.InvalidLevel'",
    );
  });

  it('should return error when members filter uses datetime column without date level', () => {
    const mockFiltersJSON: FunctionCall[] = [
      {
        function: 'filterFactory.members',
        args: ['DM.Commerce.Date', ['5', '9', '10', '14']],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      "Date level required for 'DM.Commerce.Date'. Use 'DM.Commerce.Date.Years'",
    );
  });

  it('should return error when dateFrom uses datetime column without date level', () => {
    const mockFiltersJSON: FunctionCall[] = [
      {
        function: 'filterFactory.dateFrom',
        args: ['DM.Commerce.Date', '1998-01-01T00:00:00'],
      },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain(
      "Date level required for 'DM.Commerce.Date'. Use 'DM.Commerce.Date.Years'",
    );
  });

  it.each(['filterFactory.thisYear', 'filterFactory.today'] as const)(
    'should translate %s with bare DateDimension (no level suffix required)',
    (filterFunction) => {
      const mockFiltersJSON: FunctionCall[] = [
        { function: filterFunction, args: ['DM.Commerce.Date'] },
      ];

      const result = translateFiltersFromJSONFunctionCall({
        data: mockFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      const [filter] = data as Filter[];
      expect(filter).toBeDefined();
    },
  );

  it('should return error when thisYear receives a level suffix (DateDimension arg)', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'filterFactory.thisYear', args: ['DM.Commerce.Date.Years'] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('Invalid DateDimension name format');
  });

  it('should return error when trying to use measure function as top-level filter', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('Invalid filter JSON');
  });

  it('should return error when trying to use measure function with title as top-level filter', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'measureFactory.count', args: ['DM.Commerce.Revenue', 'Revenue Count'] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('Invalid filter JSON');
  });

  it('should return error when trying to use average measure as top-level filter', () => {
    const mockFiltersJSON: FunctionCall[] = [
      { function: 'measureFactory.average', args: ['DM.Commerce.Revenue'] },
    ];

    const result = translateFiltersFromJSONFunctionCall({
      data: mockFiltersJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toContain('Invalid filter JSON');
  });

  describe('translateFiltersFromJSON', () => {
    it('should return empty array when filtersJSON is null', () => {
      const result = translateFiltersFromJSON({
        data: null as unknown as FunctionCall[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when filtersJSON is undefined', () => {
      const result = translateFiltersFromJSON({
        data: undefined as unknown as FunctionCall[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when filtersJSON is false', () => {
      const result = translateFiltersFromJSON({
        data: false as unknown as FunctionCall[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when filtersJSON is 0', () => {
      const result = translateFiltersFromJSON({
        data: 0 as unknown as FunctionCall[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when filtersJSON is empty string', () => {
      const result = translateFiltersFromJSON({
        data: '' as unknown as FunctionCall[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should translate empty array to empty array', () => {
      const result = translateFiltersFromJSON({
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
      const invalidFiltersJSON = [
        'DM.Country.Country',
        'DM.Brand.Brand',
      ] as unknown as FunctionCall[];

      const result = translateFiltersFromJSON({
        data: invalidFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid filters JSON. Expected an array of function calls with 'function' and 'args' properties.",
      );
    });

    it('should return error for array of objects missing function property', () => {
      const invalidFiltersJSON = [
        { args: ['DM.Country.Country', ['United States']] },
      ] as unknown as FunctionCall[];

      const result = translateFiltersFromJSON({
        data: invalidFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid filters JSON. Expected an array of function calls with 'function' and 'args' properties.",
      );
    });

    it('should return error for array of objects missing args property', () => {
      const invalidFiltersJSON = [
        { function: 'filterFactory.members' },
      ] as unknown as FunctionCall[];

      const result = translateFiltersFromJSON({
        data: invalidFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid filters JSON. Expected an array of function calls with 'function' and 'args' properties.",
      );
    });

    it('should return error for array containing non-objects', () => {
      const invalidFiltersJSON = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
        'not an object',
      ] as unknown as FunctionCall[];

      const result = translateFiltersFromJSON({
        data: invalidFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid filters JSON. Expected an array of function calls with 'function' and 'args' properties.",
      );
    });

    it('should return error for array containing null values', () => {
      const invalidFiltersJSON = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
        null,
      ] as unknown as FunctionCall[];

      const result = translateFiltersFromJSON({
        data: invalidFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid filters JSON. Expected an array of function calls with 'function' and 'args' properties.",
      );
    });

    it('should translate valid parsed function call array', () => {
      const validFiltersJSON = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
      ];

      const result = translateFiltersFromJSON({
        data: validFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
    });
  });

  describe('translateHighlightsFromJSONFunctionCall', () => {
    it('should translate highlights from parsed function calls', () => {
      const mockHighlightsJSON: FunctionCall[] = [
        { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
        { function: 'filterFactory.members', args: ['DM.Brand.Brand', ['Brand A']] },
      ];

      const result = translateHighlightsFromJSONFunctionCall({
        data: mockHighlightsJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(data).toHaveLength(2);
      expect(withoutGuids(data)).toMatchSnapshot();
    });

    it('should return error when trying to use measure function as highlight', () => {
      const mockHighlightsJSON: FunctionCall[] = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
      ];

      const result = translateHighlightsFromJSONFunctionCall({
        data: mockHighlightsJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Invalid filter JSON');
    });

    it('should return error when trying to use filter relation as highlight', () => {
      const mockHighlightsJSON: FunctionCall[] = [
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

      const result = translateHighlightsFromJSONFunctionCall({
        data: mockHighlightsJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Invalid filter JSON');
    });

    it('should return error when trying to use average measure as highlight', () => {
      const mockHighlightsJSON: FunctionCall[] = [
        { function: 'measureFactory.average', args: ['DM.Commerce.Revenue'] },
      ];

      const result = translateHighlightsFromJSONFunctionCall({
        data: mockHighlightsJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('Invalid filter JSON');
    });
  });

  describe('postProcessFilter config simplification', () => {
    it('should omit config from composeCode when all values match defaults for members filter', () => {
      // Create a filter with default config values
      // This simulates what happens when translateFiltersFromJSON processes a filter
      // that was created with merged defaults
      const mockFiltersJSON: FunctionCall[] = [
        {
          function: 'filterFactory.members',
          args: ['DM.Commerce.Date.Months', ['2012-01-01T00:00:00']],
        },
      ];

      const result = translateFiltersFromJSONFunctionCall({
        data: mockFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(Array.isArray(data)).toBe(true);
      const filters = data as any[];
      expect(filters.length).toBe(1);

      const filter = filters[0];
      // Verify composeCode doesn't include config when all values are defaults
      expect(filter.composeCode).toBe(
        "filterFactory.members(DM.Commerce.Date.Months, ['2012-01-01T00:00:00'])",
      );
      // Verify config is not included in composeCode
      expect(filter.composeCode).not.toContain('disabled');
      expect(filter.composeCode).not.toContain('locked');
      expect(filter.composeCode).not.toContain('excludeMembers');
      expect(filter.composeCode).not.toContain('enableMultiSelection');
      expect(filter.composeCode).not.toContain('deactivatedMembers');
    });

    it('should include only non-default config values in composeCode', () => {
      // This test verifies that when a filter has non-default config values,
      // they are preserved in the composeCode
      const mockFiltersJSON: FunctionCall[] = [
        {
          function: 'filterFactory.members',
          args: ['DM.Country.Country', ['United States'], { disabled: true, excludeMembers: true }],
        },
      ];

      const result = translateFiltersFromJSONFunctionCall({
        data: mockFiltersJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      const filters = data as any[];
      const filter = filters[0];

      // Verify composeCode includes only non-default values
      expect(filter.composeCode).toContain('disabled: true');
      expect(filter.composeCode).toContain('excludeMembers: true');
      // Verify default values are not included
      expect(filter.composeCode).not.toContain('locked');
      expect(filter.composeCode).not.toContain('enableMultiSelection');
    });
  });

  describe('datetime member validation', () => {
    it('should reject compact week keys like 202500', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Date.Weeks', ['202500']],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('202500');
    });

    it('should reject compact week keys nested inside filter relations', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.logic.or',
            args: [
              {
                function: 'filterFactory.members',
                args: ['DM.Commerce.Date.Weeks', ['202500']],
              },
              {
                function: 'filterFactory.members',
                args: ['DM.Country.Country', ['United States']],
              },
            ],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('202500');
    });

    it('should normalize valid Weeks members to ISO start-of-week datetimes', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Date.Weeks', ['2024-12-30T00:00:00']],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result) as Filter[];
      expect(isMembersFilter(data[0])).toBe(true);
      if (!isMembersFilter(data[0])) throw new Error('Expected members filter');
      expect(data[0].members[0]).toMatch(/^2024-12-30T00:00:00$/);
    });

    it('should normalize Weeks members nested inside filter relations', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.logic.and',
            args: [
              {
                function: 'filterFactory.members',
                args: ['DM.Commerce.Date.Weeks', ['2024-12-30T00:00:00']],
              },
              {
                function: 'filterFactory.members',
                args: ['DM.Country.Country', ['United States']],
              },
            ],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      const membersFilters = flattenFilters(data).filter(isMembersFilter);
      expect(membersFilters.some((filter) => filter.members[0] === '2024-12-30T00:00:00')).toBe(
        true,
      );
    });

    it('should reject dateRange with end-of-day exclusive to anti-pattern', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.dateRange',
            args: ['DM.Commerce.Date.Days', '2026-05-05T00:00:00', '2026-05-05T23:59:59'],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('T23:59:59');
    });

    it('should accept empty members array as include-all no-op', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Date.Months', []],
          },
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Date.Years', []],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const filters = flattenFilters(getSuccessData(result));
      expect(filters).toHaveLength(2);
      expect(filters.every((f) => isMembersFilter(f) && f.members.length === 0)).toBe(true);

      const monthsFilter = filters.find(
        (f) =>
          isMembersFilter(f) &&
          isLevelAttribute(f.attribute) &&
          f.attribute.granularity === DateLevels.Months,
      );
      const yearsFilter = filters.find(
        (f) =>
          isMembersFilter(f) &&
          isLevelAttribute(f.attribute) &&
          f.attribute.granularity === DateLevels.Years,
      );

      expect(monthsFilter).toBeDefined();
      expect(yearsFilter).toBeDefined();
      expect(monthsFilter?.composeCode).toContain('DM.Commerce.Date.Months');
      expect(yearsFilter?.composeCode).toContain('DM.Commerce.Date.Years');
    });

    it('should reject WeekOfYear members filters', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Date.WeekOfYear', ['2024-01-01T00:00:00']],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('WeekOfYear');
    });

    it('should reject duplicate members after normalization', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Date.Weeks', ['2024-12-30T00:00:00', '2024-12-31T12:00:00']],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Expected translation to fail');
      }
      const duplicateError = result.errors.find((error) => error.path === 'filters[0]');
      expect(duplicateError).toBeDefined();
      expect(duplicateError!.message).toContain('duplicate member');
    });

    it('should normalize Years members from 4-digit year', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Date.Years', ['2024']],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result) as Filter[];
      expect(isMembersFilter(data[0])).toBe(true);
      if (!isMembersFilter(data[0])) throw new Error('Expected members filter');
      expect(data[0].members[0]).toBe('2024-01-01T00:00:00');
    });

    it('should reject dateRange when from is after to', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.dateRange',
            args: ['DM.Commerce.Date.Days', '2026-05-06', '2026-05-05'],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain("'from' must be less than or equal to 'to'");
    });

    it('should reject dateRange with no bounds', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.dateRange',
            args: ['DM.Commerce.Date.Days'],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain("at least one of 'from' or 'to'");
    });

    it('should reject dateRelative with non-positive count', () => {
      const result = translateFiltersFromJSONFunctionCall({
        data: [
          {
            function: 'filterFactory.dateRelative',
            args: ['DM.Commerce.Date.Days', 0, 0],
          },
        ],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)[0]).toContain('count must be greater than zero');
    });
  });
});
