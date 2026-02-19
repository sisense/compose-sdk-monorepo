import { Sort, withoutGuids } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { NlqTranslationErrorResult } from '../types.js';
import { translateQueryFromJSON } from './translate-query-from-json.js';

describe('translateQueryFromJSON', () => {
  it('should translate query json', () => {
    const mockQueryJSON = {
      dimensions: ['DM.Category.Category', 'DM.Brand.Brand'],
      measures: [
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Total Revenue'],
        },
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost', 'Total Cost'],
        },
      ],
      filters: [
        {
          function: 'filterFactory.members',
          args: ['DM.Commerce.Date.Years', ['2024-01-01T00:00:00']],
        },
        {
          function: 'filterFactory.topRanking',
          args: [
            'DM.Brand.Brand',
            {
              function: 'measureFactory.sum',
              args: ['DM.Commerce.Revenue', 'Total Revenue'],
            },
            5,
          ],
        },
      ],
    };

    const result = translateQueryFromJSON({
      data: mockQueryJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    expect(result).toHaveProperty('data');
    const query = (result as { success: true; data: any }).data;
    expect({
      ...query,
      ...(query.filters && { filters: withoutGuids(query.filters) }),
    }).toMatchSnapshot();
  });

  describe('error handling', () => {
    it('should return structured error when dimensions translation fails', () => {
      const mockQueryJSON = {
        dimensions: [123, 'DM.Brand.Brand'], // Invalid: contains non-string
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as NlqTranslationErrorResult;
      expect(errorResponse.errors).toHaveLength(1);
      expect(errorResponse.errors[0]).toMatchObject({
        category: 'dimensions',
        index: 0,
        input: 123,
        message: expect.stringContaining(
          'Invalid dimension item. Expected a string (composeCode) or object with "column" and optional "sortType".',
        ),
      });
    });

    it('should return structured error when measures translation fails', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          'invalid-measure', // Invalid: should be function call object
        ],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as NlqTranslationErrorResult;
      expect(errorResponse.errors).toHaveLength(1);
      expect(errorResponse.errors[0]).toMatchObject({
        category: 'measures',
        index: 0,
        input: 'invalid-measure',
        message: expect.stringContaining(
          'Invalid measure item. Expected a function call (function/args) or object with "column" and optional "sortType".',
        ),
      });
    });

    it('should return structured error when filters translation fails', () => {
      const invalidFilter = {
        function: 'filterFactory.members',
        args: ['DM.NonExistentTable.Column', ['test']], // Invalid: table doesn't exist
      };
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [invalidFilter],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as NlqTranslationErrorResult;
      expect(errorResponse.errors).toHaveLength(1);
      expect(errorResponse.errors[0]).toMatchObject({
        category: 'filters',
        index: 0,
        input: invalidFilter,
        message: expect.stringContaining('Table "NonExistentTable" not found in the data model'),
      });
    });

    it('should return structured error when highlights translation fails', () => {
      const invalidHighlight = {
        function: 'measureFactory.sum', // Invalid: measures cannot be highlights
        args: ['DM.Commerce.Revenue'],
      };
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [],
        highlights: [invalidHighlight],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as NlqTranslationErrorResult;
      expect(errorResponse.errors).toHaveLength(1);
      expect(errorResponse.errors[0]).toMatchObject({
        category: 'highlights',
        index: 0,
        input: invalidHighlight,
        message: expect.stringContaining('Invalid filter JSON'),
      });
    });

    it('should collect and return multiple structured errors from different contexts', () => {
      const invalidMeasure = {
        function: 'measureFactory.nonExistentFunction', // Invalid: function doesn't exist
        args: ['DM.Commerce.Revenue'],
      };
      const invalidFilter = {
        function: 'filterFactory.members',
        args: ['DM.InvalidTable.Column', ['test']], // Invalid: table doesn't exist
      };
      const mockQueryJSON = {
        dimensions: [null, 'DM.Brand.Brand'], // Invalid: contains null
        measures: [invalidMeasure],
        filters: [invalidFilter],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as NlqTranslationErrorResult;
      expect(errorResponse.errors).toHaveLength(3);

      // Check dimensions error
      const dimensionError = errorResponse.errors.find((e) => e.category === 'dimensions');
      expect(dimensionError).toBeDefined();
      expect(dimensionError).toMatchObject({
        category: 'dimensions',
        index: 0,
        input: null,
        message: expect.stringContaining(
          'Invalid dimension item. Expected a string (composeCode) or object with "column" and optional "sortType".',
        ),
      });

      // Check measures error
      const measureError = errorResponse.errors.find((e) => e.category === 'measures');
      expect(measureError).toBeDefined();
      expect(measureError).toMatchObject({
        category: 'measures',
        index: 0,
        input: invalidMeasure,
        message: expect.stringContaining('measureFactory.nonExistentFunction'),
      });

      // Check filters error
      const filterError = errorResponse.errors.find((e) => e.category === 'filters');
      expect(filterError).toBeDefined();
      expect(filterError).toMatchObject({
        category: 'filters',
        index: 0,
        input: invalidFilter,
        message: expect.stringContaining('Table "InvalidTable" not found'),
      });
    });

    it('should handle complex nested filter errors with proper context', () => {
      const invalidFilter = {
        function: 'filterFactory.logic.and',
        args: [
          {
            function: 'filterFactory.members',
            args: ['DM.Country.NonExistentColumn', ['test']], // Invalid column
          },
          {
            function: 'filterFactory.measureGreaterThan',
            args: [
              {
                function: 'measureFactory.invalidAggregation', // Invalid measure function
                args: ['DM.Commerce.Revenue'],
              },
              1000,
            ],
          },
        ],
      };
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [invalidFilter],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as { success: false; errors: any[] };
      expect(errorResponse.errors).toHaveLength(1);
      expect(errorResponse.errors[0]).toMatchObject({
        category: 'filters',
        index: 0,
        input: invalidFilter,
      });
    });

    it('should handle invalid function calls in measures with proper context', () => {
      const invalidMeasure = {
        function: 'filterFactory.members', // Invalid: filter function used as measure
        args: ['DM.Country.Country', ['United States']],
      };
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [invalidMeasure],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as { success: false; errors: any[] };
      expect(errorResponse.errors).toHaveLength(1);
      expect(errorResponse.errors[0]).toMatchObject({
        category: 'measures',
        index: 0,
        input: invalidMeasure,
        message: expect.stringContaining('Invalid measure JSON'),
      });
    });

    it('should handle attribute validation errors in dimensions', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category'], // Invalid: insufficient parts
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as { success: false; errors: any[] };
      expect(errorResponse.errors).toHaveLength(1);
      expect(errorResponse.errors[0]).toMatchObject({
        category: 'dimensions',
        index: 0,
        input: 'DM.Category',
        message: expect.stringContaining('Invalid dimensional element name format'),
      });
    });

    it('should handle date level validation errors in filters', () => {
      const invalidFilter = {
        function: 'filterFactory.members',
        args: ['DM.Country.Country.Years', ['2024']], // Invalid: date level on non-datetime column
      };
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [invalidFilter],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('errors');
      const errorResponse = result as { success: false; errors: any[] };
      expect(errorResponse.errors).toHaveLength(1);
      expect(errorResponse.errors[0]).toMatchObject({
        category: 'filters',
        index: 0,
        input: invalidFilter,
        message: expect.stringMatching(/Invalid date level "Years".*not a datetime column/),
      });
    });
  });

  describe('styled columns', () => {
    it('should translate styled dimension columns with sortType', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category', { column: 'DM.Brand.Brand', sortType: 'sortAsc' }],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('data');
      const query = (result as { success: true; data: any }).data;
      expect(query.dimensions).toHaveLength(2);
      expect(query.dimensions[0].composeCode).toBe('DM.Category.Category');
      expect(query.dimensions[0].getSort()).toBe(0); // Sort.None
      expect(query.dimensions[1].composeCode).toBe('DM.Brand.Brand');
      expect(query.dimensions[1].getSort()).toBe(1); // Sort.Ascending
    });

    it('should translate styled dimension columns without sortType', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category', { column: 'DM.Brand.Brand' }],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('data');
      const query = (result as { success: true; data: any }).data;
      expect(query.dimensions).toHaveLength(2);
      expect(query.dimensions[0].composeCode).toBe('DM.Category.Category');
      expect(query.dimensions[0].getSort()).toBe(Sort.None);
      expect(query.dimensions[1].composeCode).toBe('DM.Brand.Brand');
      expect(query.dimensions[1].getSort()).toBe(Sort.None); // no sortType provided
    });

    it('should translate styled measure columns with sortType', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
          {
            column: {
              function: 'measureFactory.sum',
              args: ['DM.Commerce.Cost', 'Total Cost'],
            },
            sortType: 'sortDesc',
          },
        ],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('data');
      const query = (result as { success: true; data: any }).data;
      expect(query.measures).toHaveLength(2);
      expect(query.measures[0].composeCode).toBe(
        "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
      );
      expect(query.measures[0].getSort()).toBe(Sort.None);
      expect(query.measures[1].composeCode).toBe(
        "measureFactory.sum(DM.Commerce.Cost, 'Total Cost')",
      );
      expect(query.measures[1].getSort()).toBe(Sort.Descending);
    });

    it('should translate styled measure columns without sortType', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
          {
            column: {
              function: 'measureFactory.sum',
              args: ['DM.Commerce.Cost', 'Total Cost'],
            },
          },
        ],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('data');
      const query = (result as { success: true; data: any }).data;
      expect(query.measures).toHaveLength(2);
      expect(query.measures[0].composeCode).toBe(
        "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
      );
      expect(query.measures[0].getSort()).toBe(Sort.None);
      expect(query.measures[1].composeCode).toBe(
        "measureFactory.sum(DM.Commerce.Cost, 'Total Cost')",
      );
      expect(query.measures[1].getSort()).toBe(Sort.None); // no sortType provided
    });

    it('should translate mixed styled and non-styled columns', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category', { column: 'DM.Brand.Brand', sortType: 'sortAsc' }],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
          {
            column: {
              function: 'measureFactory.sum',
              args: ['DM.Commerce.Cost', 'Total Cost'],
            },
            sortType: 'sortDesc',
          },
        ],
        filters: [],
      };

      const result = translateQueryFromJSON({
        data: mockQueryJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('data');
      const query = (result as { success: true; data: any }).data;
      expect(query.dimensions).toHaveLength(2);
      expect(query.dimensions[0].composeCode).toBe('DM.Category.Category');
      expect(query.dimensions[0].getSort()).toBe(Sort.None);
      expect(query.dimensions[1].composeCode).toBe('DM.Brand.Brand');
      expect(query.dimensions[1].getSort()).toBe(Sort.Ascending);

      expect(query.measures).toHaveLength(2);
      expect(query.measures[0].composeCode).toBe(
        "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')",
      );
      expect(query.measures[0].getSort()).toBe(Sort.None);
      expect(query.measures[1].composeCode).toBe(
        "measureFactory.sum(DM.Commerce.Cost, 'Total Cost')",
      );
      expect(query.measures[1].getSort()).toBe(Sort.Descending);
    });
  });
});
