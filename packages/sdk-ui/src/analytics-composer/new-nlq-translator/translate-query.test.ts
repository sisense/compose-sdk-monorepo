import { describe, it, expect } from 'vitest';
import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { translateQueryJSON } from './translate-query.js';
import { withoutGuids } from '@sisense/sdk-data';

describe('translateQuery', () => {
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

    const query = translateQueryJSON(
      mockQueryJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect({
      ...query,
      ...(query.filters && { filters: withoutGuids(query.filters) }),
    }).toMatchSnapshot();
  });

  describe('error handling', () => {
    it('should throw error with contextual information when dimensions translation fails', () => {
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

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 1 error\(s\):/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/\[dimensions\]/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Invalid dimensions JSON. Expected an array of strings./);
    });

    it('should throw error with contextual information when measures translation fails', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          'invalid-measure', // Invalid: should be function call object
        ],
        filters: [],
      };

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 1 error\(s\):/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/\[measures\]/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Invalid measures JSON. Expected an array of function calls/);
    });

    it('should throw error with contextual information when filters translation fails', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [
          {
            function: 'filterFactory.members',
            args: ['DM.NonExistentTable.Column', ['test']], // Invalid: table doesn't exist
          },
        ],
      };

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 1 error\(s\):/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/\[filters\]/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Table "NonExistentTable" not found in the data model/);
    });

    it('should throw error with contextual information when highlights translation fails', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [],
        highlights: [
          {
            function: 'measureFactory.sum', // Invalid: measures cannot be highlights
            args: ['DM.Commerce.Revenue'],
          },
        ],
      };

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 1 error\(s\):/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/\[highlights\]/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Invalid filter JSON/);
    });

    it('should collect and report multiple errors from different contexts', () => {
      const mockQueryJSON = {
        dimensions: [null, 'DM.Brand.Brand'], // Invalid: contains null
        measures: [
          {
            function: 'measureFactory.nonExistentFunction', // Invalid: function doesn't exist
            args: ['DM.Commerce.Revenue'],
          },
        ],
        filters: [
          {
            function: 'filterFactory.members',
            args: ['DM.InvalidTable.Column', ['test']], // Invalid: table doesn't exist
          },
        ],
      };

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 3 error\(s\):/);

      // Verify all three contexts are mentioned
      const error = (() => {
        try {
          translateQueryJSON(
            mockQueryJSON,
            MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
            MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
          );
        } catch (e) {
          return e as Error;
        }
        throw new Error('Expected translation to throw');
      })();

      expect(error.message).toContain('[dimensions]');
      expect(error.message).toContain('[measures]');
      expect(error.message).toContain('[filters]');

      // Verify specific error messages
      expect(error.message).toContain('Invalid dimensions JSON. Expected an array of strings');
      expect(error.message).toContain('measureFactory.nonExistentFunction');
      expect(error.message).toContain('Table "InvalidTable" not found');
    });

    it('should handle complex nested filter errors with proper context', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [
          {
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
          },
        ],
      };

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 1 error\(s\):/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/\[filters\]/);
    });

    it('should handle invalid function calls in measures with proper context', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'filterFactory.members', // Invalid: filter function used as measure
            args: ['DM.Country.Country', ['United States']],
          },
        ],
        filters: [],
      };

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 1 error\(s\):/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/\[measures\]/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Invalid measure JSON/);
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

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 1 error\(s\):/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/\[dimensions\]/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Invalid attribute name format/);
    });

    it('should handle date level validation errors in filters', () => {
      const mockQueryJSON = {
        dimensions: ['DM.Category.Category'],
        measures: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        filters: [
          {
            function: 'filterFactory.members',
            args: ['DM.Country.Country.Years', ['2024']], // Invalid: date level on non-datetime column
          },
        ],
      };

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Translation failed with 1 error\(s\):/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/\[filters\]/);

      expect(() =>
        translateQueryJSON(
          mockQueryJSON,
          MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        ),
      ).toThrow(/Invalid date level "Years".*not a datetime column/);
    });
  });
});
