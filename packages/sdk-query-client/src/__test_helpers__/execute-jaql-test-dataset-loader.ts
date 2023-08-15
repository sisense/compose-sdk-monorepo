import {
  DimensionalAttribute,
  DimensionalBaseMeasure,
  DimensionalLevelAttribute,
  MembersFilter,
  NumericFilter,
  QueryResultData,
} from '@sisense/sdk-data';
import type { QueryDescription } from '../types.js';
import { downloadTestDataFromArtifactory } from './artifactory-test-data-loader.js';

const queryInputSamples: {
  testId: string;
  queryInput: QueryDescription;
}[] = [
  {
    testId: '1. sum Revenue / AgeRange ',
    queryInput: {
      dataSource: 'Sample ECommerce',
      attributes: [new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute')],
      filters: [],
      highlights: [],
      measures: [
        new DimensionalBaseMeasure(
          'sum Revenue',
          new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'attribute'),
          'sum',
        ),
      ],
    },
  },
  {
    testId: '2. sum Revenue / AgeRange / Gender',
    queryInput: {
      dataSource: 'Sample ECommerce',
      attributes: [
        new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute'),
        new DimensionalAttribute('Gender', '[Commerce.Gender]', 'attribute'),
      ],
      measures: [
        new DimensionalBaseMeasure(
          'sum Revenue',
          new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'attribute'),
          'sum',
        ),
      ],
      filters: [],
      highlights: [],
    },
  },
  {
    testId: '3. Complex date format',
    queryInput: {
      dataSource: 'Sample ECommerce',
      attributes: [
        new DimensionalLevelAttribute(
          'Quarters',
          '[Commerce.Date (Calendar)]',
          'Quarters',
          'Q yyyy',
        ),
        new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute'),
      ],
      measures: [
        new DimensionalBaseMeasure(
          'sum Revenue',
          new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'attribute'),
          'sum',
        ),
      ],
      filters: [],
      highlights: [
        new MembersFilter(
          new DimensionalLevelAttribute('Years', '[Commerce.Date (Calendar)]', 'Years'),
          ['2011-01-01T00:00:00'],
        ),
        new MembersFilter(new DimensionalAttribute('Gender', '[Commerce.Gender]'), ['Female']),
        new NumericFilter(
          new DimensionalAttribute('Revenue', '[Commerce.Revenue]', 'attribute'),
          'fromNotEqual',
          0,
        ),
      ],
    },
  },
];

const setAllFiltersAndHighlightsAsScopeFilters = (
  queryInputSample: (typeof queryInputSamples)[0],
) => {
  queryInputSample.queryInput.filters.forEach((filter) => (filter.isScope = true));
  queryInputSample.queryInput.highlights.forEach((highlight) => (highlight.isScope = true));
  return queryInputSample;
};

export type ExecuteJaqlTestDataset = ({
  testJaqlData: TestJaqlDataSample;
} & (typeof queryInputSamples)[0])[];

export const getExecuteJaqlTestDataset = async (): Promise<ExecuteJaqlTestDataset> => {
  const testJaqlData = await downloadTestDataFromArtifactory<TestJaqlDataSample[]>(
    'query-jaql-test-data',
  );
  return queryInputSamples
    .map(setAllFiltersAndHighlightsAsScopeFilters)
    .map((queryInputSample) => ({
      ...queryInputSample,
      testJaqlData: testJaqlData.find(
        (testJaqlDataSample) => testJaqlDataSample.testId === queryInputSample.testId,
      )!,
    }));
};

type TestJaqlDataSample = {
  testId: string;
  datasource: string;
  requestBody: object & { metadata: object };
  expectedResponse: object & { values: object };
  expectedQueryResultData: QueryResultData;
};
