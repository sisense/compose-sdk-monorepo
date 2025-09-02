import { describe, it, expect } from 'vitest';
import { translateQueryToJaql } from './translate-query-to-jaql.js';
import { BaseQueryParams } from '@/query-execution/types.js';
import { MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE } from '../__mocks__/mock-data-sources.js';
import { createAttribute, createMeasure, filterFactory } from '@sisense/sdk-data';

describe('translateQueryParamsToJaql', () => {
  it('should convert BaseQueryParams to JAQL payload', () => {
    const categoryAttribute = createAttribute({
      name: 'Category',
      type: 'text-attribute',
      expression: '[Category.Category]',
    });
    const categoryCountMeasure = createMeasure({
      name: 'Category Count',
      agg: 'count',
      attribute: categoryAttribute,
    });
    const queryParams: BaseQueryParams = {
      dataSource: {
        ...MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        type: 'elasticube',
      },
      dimensions: [categoryAttribute],
      measures: [categoryCountMeasure],
      filters: [filterFactory.members(categoryAttribute, ['Category A', 'Category B'])],
      highlights: [],
    };

    const result = translateQueryToJaql(queryParams);

    expect(result).toBeDefined();
    expect(result.metadata).toMatchSnapshot();
  });
});
