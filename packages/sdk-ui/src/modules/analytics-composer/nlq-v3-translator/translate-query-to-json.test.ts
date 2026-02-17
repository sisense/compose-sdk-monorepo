import { createAttribute, filterFactory, measureFactory, Sort } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { BaseQueryParams } from '@/domains/query-execution/types.js';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { translateQueryFromJSON } from './translate-query-from-json.js';
import { translateQueryToJSON } from './translate-query-to-json.js';
import { FunctionCall } from './types.js';

describe('translateQueryToJSON', () => {
  // Create test attributes
  const Category = createAttribute({
    name: 'Category',
    type: 'text-attribute',
    expression: '[Category.Category]',
    dataSource: { title: 'Sample ECommerce', live: false },
  });

  const Brand = createAttribute({
    name: 'Brand',
    type: 'text-attribute',
    expression: '[Brand.Brand]',
    dataSource: { title: 'Sample ECommerce', live: false },
  });

  const Revenue = createAttribute({
    name: 'Revenue',
    type: 'numeric-attribute',
    expression: '[Commerce.Revenue]',
    dataSource: { title: 'Sample ECommerce', live: false },
  });

  const Cost = createAttribute({
    name: 'Cost',
    type: 'numeric-attribute',
    expression: '[Commerce.Cost]',
    dataSource: { title: 'Sample ECommerce', live: false },
  });

  const DateYears = createAttribute({
    name: 'Date',
    type: 'datelevel',
    expression: '[Commerce.Date]',
    granularity: 'Years',
    format: 'yyyy',
    dataSource: { title: 'Sample ECommerce', live: false },
  });

  it('should translate BaseQueryParams to NlqResponseJSON', () => {
    const query: BaseQueryParams = {
      dimensions: [Category, Brand],
      measures: [
        measureFactory.sum(Revenue, 'Total Revenue'),
        measureFactory.sum(Cost, 'Total Cost'),
      ],
      filters: [
        filterFactory.members(DateYears, ['2024-01-01T00:00:00']),
        filterFactory.topRanking(Brand, measureFactory.sum(Revenue, 'Total Revenue'), 5),
      ],
    };

    const result = translateQueryToJSON(query);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toEqual({
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
    });
  });

  it('should handle empty arrays', () => {
    const query: BaseQueryParams = {
      dimensions: [],
      measures: [],
      filters: [],
    };

    const result = translateQueryToJSON(query);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toEqual({
      dimensions: [],
      measures: [],
      filters: [],
    });
  });

  it('should handle optional highlights', () => {
    const query: BaseQueryParams = {
      dimensions: [Category],
      measures: [measureFactory.sum(Revenue)],
      filters: [],
      highlights: [filterFactory.equals(Brand, 'Brand A')],
    };

    const result = translateQueryToJSON(query);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.highlights).toEqual([
      {
        function: 'filterFactory.equals',
        args: ['DM.Brand.Brand', 'Brand A'],
      },
    ]);
  });

  it('should handle FilterRelations', () => {
    const filter1 = filterFactory.members(Category, ['Category A']);
    const filter2 = filterFactory.members(Brand, ['Brand B']);
    const filterRelations = filterFactory.logic.and(filter1, filter2);

    const query: BaseQueryParams = {
      dimensions: [Category],
      measures: [measureFactory.sum(Revenue)],
      filters: filterRelations,
    };

    const result = translateQueryToJSON(query);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.filters).toHaveLength(1);
    expect(result.data.filters[0]).toEqual({
      function: 'filterFactory.logic.and',
      args: [
        {
          function: 'filterFactory.members',
          args: ['DM.Category.Category', ['Category A']],
        },
        {
          function: 'filterFactory.members',
          args: ['DM.Brand.Brand', ['Brand B']],
        },
      ],
    });
  });

  it('should handle nested FilterRelations', () => {
    const filter1 = filterFactory.members(Category, ['Category A']);
    const filter2 = filterFactory.members(Brand, ['Brand B']);
    const filter3 = filterFactory.members(DateYears, ['2024-01-01T00:00:00']);
    const innerRelation = filterFactory.logic.or(filter1, filter2);
    const outerRelation = filterFactory.logic.and(innerRelation, filter3);

    const query: BaseQueryParams = {
      dimensions: [Category],
      measures: [measureFactory.sum(Revenue)],
      filters: outerRelation,
    };

    const result = translateQueryToJSON(query);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.filters).toHaveLength(1);
    const filterCall = result.data.filters[0] as FunctionCall;
    expect(filterCall).toBeDefined();
    expect(filterCall.function).toBe('filterFactory.logic.and');
    const innerCall = filterCall.args[0] as FunctionCall;
    expect(innerCall).toBeDefined();
    expect(innerCall.function).toBe('filterFactory.logic.or');
  });

  it('should handle calculated measures', () => {
    const baseMeasure = measureFactory.sum(Revenue);
    const calculatedMeasure = measureFactory.customFormula('Profit', '[Revenue] - [Cost]', {
      Revenue: baseMeasure,
      Cost: measureFactory.sum(Cost),
    });

    const query: BaseQueryParams = {
      dimensions: [Category],
      measures: [calculatedMeasure],
      filters: [],
    };

    const result = translateQueryToJSON(query);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.measures).toHaveLength(1);
    const measureCall = result.data.measures[0] as FunctionCall;
    expect(measureCall).toBeDefined();
    expect(measureCall.function).toBe('measureFactory.customFormula');
    expect(measureCall.args[0]).toBe('Profit');
    expect(measureCall.args[1]).toBe('[Revenue] - [Cost]');
    expect(typeof measureCall.args[2]).toBe('object');
  });

  describe('error handling', () => {
    it('should return structured error when dimension is missing composeCode', () => {
      const invalidAttribute = { ...Category, composeCode: undefined } as any;

      const query: BaseQueryParams = {
        dimensions: [invalidAttribute],
        measures: [],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe('dimensions');
      expect(result.errors[0].index).toBe(0);
      expect(result.errors[0].message).toMatch(/missing composeCode/);
      expect(result.errors[0].input).toBe(invalidAttribute);
    });

    it('should return structured error when measure is missing composeCode', () => {
      const invalidMeasure = { ...measureFactory.sum(Revenue), composeCode: undefined } as any;

      const query: BaseQueryParams = {
        dimensions: [],
        measures: [invalidMeasure],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe('measures');
      expect(result.errors[0].index).toBe(0);
      expect(result.errors[0].message).toMatch(/missing composeCode/);
      expect(result.errors[0].input).toBe(invalidMeasure);
    });

    it('should return structured error when filter is missing composeCode', () => {
      const invalidFilter = {
        ...filterFactory.members(Category, ['A']),
        composeCode: undefined,
      } as any;

      const query: BaseQueryParams = {
        dimensions: [],
        measures: [],
        filters: [invalidFilter],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe('filters');
      expect(result.errors[0].index).toBe(0);
      expect(result.errors[0].message).toMatch(/missing composeCode/);
      expect(result.errors[0].input).toBe(invalidFilter);
    });

    it('should return structured error when FilterRelations is missing composeCode', () => {
      const filter1 = filterFactory.members(Category, ['A']);
      const filter2 = filterFactory.members(Brand, ['B']);
      const invalidRelations = filterFactory.logic.and(filter1, filter2);
      (invalidRelations as any).composeCode = undefined;

      const query: BaseQueryParams = {
        dimensions: [],
        measures: [],
        filters: invalidRelations,
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe('filters');
      expect(result.errors[0].index).toBe(-1);
      expect(result.errors[0].message).toMatch(/missing composeCode/);
      expect(result.errors[0].input).toBe(invalidRelations);
    });

    it('should return structured error when dimension composeCode is invalid', () => {
      const invalidAttribute = { ...Category, composeCode: 'Invalid.Code' } as any;

      const query: BaseQueryParams = {
        dimensions: [invalidAttribute],
        measures: [],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].category).toBe('dimensions');
      expect(result.errors[0].index).toBe(0);
      expect(result.errors[0].message).toMatch(/Expected composeCode to start with "DM."/);
      expect(result.errors[0].input).toBe(invalidAttribute);
    });

    it('should collect multiple errors from different categories', () => {
      const invalidAttribute = { ...Category, composeCode: undefined } as any;
      const invalidMeasure = { ...measureFactory.sum(Revenue), composeCode: undefined } as any;

      const query: BaseQueryParams = {
        dimensions: [invalidAttribute],
        measures: [invalidMeasure],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].category).toBe('dimensions');
      expect(result.errors[1].category).toBe('measures');
    });
  });

  describe('styled columns', () => {
    it('should translate styled dimension columns with sortType', () => {
      const sortedCategory = Category.sort(Sort.Ascending);
      const query: BaseQueryParams = {
        dimensions: [sortedCategory, Brand],
        measures: [measureFactory.sum(Revenue)],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.dimensions).toEqual([
        { column: 'DM.Category.Category', sortType: 'sortAsc' },
        'DM.Brand.Brand',
      ]);
    });

    it('should translate styled dimension columns without sortType', () => {
      const query: BaseQueryParams = {
        dimensions: [Category, Brand],
        measures: [measureFactory.sum(Revenue)],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.dimensions).toEqual(['DM.Category.Category', 'DM.Brand.Brand']);
    });

    it('should translate styled measure columns with sortType', () => {
      const sortedMeasure = measureFactory.sum(Revenue, 'Total Revenue').sort(Sort.Descending);
      const query: BaseQueryParams = {
        dimensions: [Category],
        measures: [measureFactory.sum(Cost, 'Total Cost'), sortedMeasure],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.measures).toEqual([
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost', 'Total Cost'],
        },
        {
          column: {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
          sortType: 'sortDesc',
        },
      ]);
    });

    it('should translate styled measure columns without sortType', () => {
      const query: BaseQueryParams = {
        dimensions: [Category],
        measures: [
          measureFactory.sum(Revenue, 'Total Revenue'),
          measureFactory.sum(Cost, 'Total Cost'),
        ],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.measures).toEqual([
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Total Revenue'],
        },
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost', 'Total Cost'],
        },
      ]);
    });

    it('should translate mixed styled and non-styled columns', () => {
      const sortedCategory = Category.sort(Sort.Ascending);
      const sortedMeasure = measureFactory.sum(Revenue, 'Total Revenue').sort(Sort.Descending);
      const query: BaseQueryParams = {
        dimensions: [sortedCategory, Brand],
        measures: [measureFactory.sum(Cost, 'Total Cost'), sortedMeasure],
        filters: [],
      };

      const result = translateQueryToJSON(query);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.dimensions).toEqual([
        { column: 'DM.Category.Category', sortType: 'sortAsc' },
        'DM.Brand.Brand',
      ]);

      expect(result.data.measures).toEqual([
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost', 'Total Cost'],
        },
        {
          column: {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
          sortType: 'sortDesc',
        },
      ]);
    });
  });

  describe('round-trip translation', () => {
    it('should produce equivalent JSON when translating JSON → CSDK → JSON', () => {
      const originalJSON = {
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
        ],
      };

      // Translate JSON → CSDK
      const translationResult = translateQueryFromJSON({
        data: originalJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
        },
      });

      expect(translationResult.success).toBe(true);
      if (!translationResult.success) return;

      const csdkQuery = translationResult.data;

      // Translate CSDK → JSON
      const roundTripResult = translateQueryToJSON(csdkQuery);

      expect(roundTripResult.success).toBe(true);
      if (!roundTripResult.success) return;

      const roundTripJSON = roundTripResult.data;

      // Compare (dimensions and measures should match exactly)
      expect(roundTripJSON.dimensions).toEqual(originalJSON.dimensions);
      expect(roundTripJSON.measures).toEqual(originalJSON.measures);
      // Filters might have slight differences in formatting, so we check structure
      expect(roundTripJSON.filters).toHaveLength(originalJSON.filters.length);
      const filterCall = roundTripJSON.filters[0] as FunctionCall;
      const originalFilterCall = originalJSON.filters[0] as FunctionCall;
      expect(filterCall).toBeDefined();
      expect(originalFilterCall).toBeDefined();
      expect(filterCall.function).toBe(originalFilterCall.function);
    });
  });
});
