/* eslint-disable sonarjs/no-duplicate-string */
import { templateForComponent } from './template.js';
import { CriteriaFilterTile } from '../filters/components/criteria-filter-tile/criteria-filter-tile.js';
import {
  Filter,
  NumericFilter,
  RankingFilter,
  TextFilter,
  createAttribute,
  createMeasure,
  filters,
} from '@sisense/sdk-data';

const template = templateForComponent(CriteriaFilterTile);

export default {
  title: 'filters/CriteriaFilterTile',
  component: CriteriaFilterTile,
};

const mockAttributeA = createAttribute({
  name: 'BrandID',
  type: 'numeric-attribute',
  expression: '[Commerce.Brand ID]',
});

const mockAttributeB = createAttribute({
  name: 'Revenue',
  type: 'numeric-attribute',
  expression: '[Commerce.Revenue]',
});

const measureAOutline = {
  name: 'avg Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'avg',
  attribute: mockAttributeB,
};

const measureBOutline = {
  name: 'sum Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'sum',
  attribute: mockAttributeB,
};

const measureCOutline = {
  name: 'max Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'max',
  attribute: mockAttributeB,
};

const measureDOutline = {
  name: 'min Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'min',
  attribute: mockAttributeB,
};

const measureEOutline = {
  name: 'count Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'count',
  attribute: mockAttributeB,
};

const measureFOutline = {
  name: 'stdev Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'stdev',
  attribute: mockAttributeB,
};

const mockMeasureA = createMeasure(measureAOutline);
const mockMeasureB = createMeasure(measureBOutline);
const mockMeasureC = createMeasure(measureCOutline);
const mockMeasureD = createMeasure(measureDOutline);
const mockMeasureE = createMeasure(measureEOutline);
const mockMeasureF = createMeasure(measureFOutline);
const measures = [
  mockMeasureA,
  mockMeasureB,
  mockMeasureC,
  mockMeasureD,
  mockMeasureE,
  mockMeasureF,
];

const onUpdate = (filter: Filter | null) => {
  console.log('onUpdate:', filter);
};

export const VerticalWithTextInput = template({
  title: 'VerticalWithTextInput',
  filter: (filters.doesntContain(mockAttributeA, 'foo') as TextFilter).serializable(),
  onUpdate,
});

export const VerticalWithSingleInput = template({
  title: 'VerticalWithSingleInput',
  filter: (filters.equals(mockAttributeA, 0) as NumericFilter).serializable(),
  onUpdate,
});

export const VerticalWithDoubleInput = template({
  title: 'VerticalWithDoubleInput',
  filter: filters.exclude(filters.between(mockAttributeA, 0, 100) as NumericFilter).serializable(),
  onUpdate,
});

export const HorizontalWithSingleInput = template({
  title: 'HorizontalWithSingleInput',
  filter: (filters.lessThanOrEqual(mockAttributeA, 10) as NumericFilter).serializable(),
  arrangement: 'horizontal',
  onUpdate,
});

export const HorizontalWithDoubleInput = template({
  title: 'HorizontalWithDoubleInput',
  filter: (filters.between(mockAttributeA, 0, 100) as NumericFilter).serializable(),
  arrangement: 'horizontal',
  onUpdate,
});

export const HorizontalWithTextInput = template({
  title: 'HorizontalWithTextInput',
  filter: (filters.doesntStartWith(mockAttributeA, 'bar') as TextFilter).serializable(),
  arrangement: 'horizontal',
  onUpdate,
});

export const VerticalRanked = template({
  title: 'VerticalRanked',
  filter: (filters.topRanking(mockAttributeA, mockMeasureB, 5) as RankingFilter).serializable(),
  onUpdate,
});

export const HorizontalRanked = template({
  title: 'HorizontalRanked',
  filter: (filters.bottomRanking(mockAttributeA, mockMeasureB, 5) as RankingFilter).serializable(),
  arrangement: 'horizontal',
  onUpdate,
});

export const VerticalRankedMulti = template({
  title: 'VerticalRanked',
  filter: (filters.topRanking(mockAttributeA, mockMeasureB, 5) as RankingFilter).serializable(),
  onUpdate,
  measures,
});

export const HorizontalRankedMulti = template({
  title: 'HorizontalRanked',
  filter: (filters.bottomRanking(mockAttributeA, mockMeasureB, 5) as RankingFilter).serializable(),
  arrangement: 'horizontal',
  onUpdate,
  measures,
});
