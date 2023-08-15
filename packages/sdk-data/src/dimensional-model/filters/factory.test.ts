/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { measures } from '../../index.js';
import { createDimension, createDateDimension } from '../dimensions.js';
import * as filters from './factory.js';
import {
  DateOperators,
  DateRangeFilter,
  ExcludeFilter,
  LogicalAttributeFilter,
  LogicalOperators,
  MeasureFilter,
  MembersFilter,
  NumericFilter,
  NumericOperators,
  RankingFilter,
  RankingOperators,
  RelativeDateFilter,
  TextFilter,
  TextOperators,
} from './filters.js';

const TextDim = createDimension({
  name: 'text',
  type: 'textdimension',
  expression: '[Text]',
});
const NumDim = createDimension({
  name: 'num',
  type: 'numericdimension',
  expression: '[Num]',
});
const DateDim = createDateDimension({
  name: 'date',
  expression: '[Date]',
});

const filter1 = new MembersFilter(TextDim, []);
const filter2 = new MembersFilter(NumDim, []);

describe('filters factory', () => {
  test('filters.union()', () => {
    const f = filters.union([filter1, filter2]);
    expect(f).toBeInstanceOf(LogicalAttributeFilter);
    expect(f).toHaveProperty('operator', LogicalOperators.Union);
    expect(f).toHaveProperty('filters', [filter1, filter2]);
  });
  test('filters.intersection()', () => {
    const f = filters.intersection([filter1, filter2]);
    expect(f).toBeInstanceOf(LogicalAttributeFilter);
    expect(f).toHaveProperty('operator', LogicalOperators.Intersection);
    expect(f).toHaveProperty('filters', [filter1, filter2]);
  });
  test('filters.exclude()', () => {
    const f = filters.exclude(filter1);
    expect(f).toBeInstanceOf(ExcludeFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('filter', filter1);
  });
  test('filters.doesntContain()', () => {
    const f = filters.doesntContain(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntContain);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filters.doesntEndWith()', () => {
    const f = filters.doesntEndWith(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntEndWith);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filters.doesntStartWith()', () => {
    const f = filters.doesntStartWith(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntStartWith);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filters.contains()', () => {
    const f = filters.contains(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.Contains);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filters.endsWith()', () => {
    const f = filters.endsWith(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.EndsWith);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filters.startsWith()', () => {
    const f = filters.startsWith(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.StartsWith);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filters.like()', () => {
    const f = filters.like(TextDim, '%mem%');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.Like);
    expect(f).toHaveProperty('valueA', '%mem%');
  });
  test('filters.doesntEqual() with string arg', () => {
    const f = filters.doesntEqual(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntEqual);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filters.doesntEqual() with numeric arg', () => {
    const f = filters.doesntEqual(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.DoesntEqual);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.equals() with string arg', () => {
    const f = filters.equals(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.Equals);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filters.equals() with numeric arg', () => {
    const f = filters.equals(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.Equals);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.greaterThan()', () => {
    const f = filters.greaterThan(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.greaterThanOrEqual()', () => {
    const f = filters.greaterThanOrEqual(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.lessThan()', () => {
    const f = filters.lessThan(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.lessThanOrEqual()', () => {
    const f = filters.lessThanOrEqual(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.To);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.between()', () => {
    const f = filters.between(NumDim, 3, 7);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.To);
    expect(f).toHaveProperty('valueB', 7);
  });
  test('filters.betweenNotEqual()', () => {
    const f = filters.betweenNotEqual(NumDim, 3, 7);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueB', 7);
  });
  test('filters.numeric()', () => {
    const f = filters.numeric(NumDim, NumericOperators.Equals, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.Equals);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.member()', () => {
    const f = filters.members(TextDim, ['mem1', 'mem2']);
    expect(f).toBeInstanceOf(MembersFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('members', ['mem1', 'mem2']);
  });
  test('filters.dateFrom()', () => {
    const f = filters.dateFrom(DateDim.Years, '2020-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('operatorA', DateOperators.From);
    expect(f).toHaveProperty('valueA', '2020-02-02T00:00:00Z');
  });
  test('filters.dateTo()', () => {
    const f = filters.dateTo(DateDim.Years, '2020-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('operatorB', DateOperators.To);
    expect(f).toHaveProperty('valueB', '2020-02-02T00:00:00Z');
  });
  test('filters.dateRange()', () => {
    const f = filters.dateRange(DateDim.Years, '2020-02-02T00:00:00Z', '2021-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('operatorA', DateOperators.From);
    expect(f).toHaveProperty('valueA', '2020-02-02T00:00:00Z');
    expect(f).toHaveProperty('operatorB', DateOperators.To);
    expect(f).toHaveProperty('valueB', '2021-02-02T00:00:00Z');
  });
  test('filters.dateRelative()', () => {
    const f = filters.dateRelative(DateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Next);
  });
  test('filters.dateRelativeFrom()', () => {
    const f = filters.dateRelativeFrom(DateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('operator', DateOperators.Next);
  });
  test('filters.dateRelativeTo()', () => {
    const f = filters.dateRelativeTo(DateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filters.thisYear()', () => {
    const f = filters.thisYear(DateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filters.thisMonth()', () => {
    const f = filters.thisMonth(DateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Months);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filters.thisQuarter()', () => {
    const f = filters.thisQuarter(DateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Quarters);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filters.today()', () => {
    const f = filters.today(DateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Days);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filters.measureBase()', () => {
    const f = filters.measureBase(NumDim, measures.sum(NumDim), NumericOperators.From, 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measures.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.measureGreaterThanOrEqual()', () => {
    const f = filters.measureGreaterThanOrEqual(measures.sum(NumDim), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measures.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.measureLessThanOrEqual()', () => {
    const f = filters.measureLessThanOrEqual(measures.sum(NumDim), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measures.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.To);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filters.measureBetween()', () => {
    const f = filters.measureBetween(measures.sum(NumDim), 3, 7);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measures.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.To);
    expect(f).toHaveProperty('valueB', 7);
  });
  test('filters.measureBetweenNotEqual()', () => {
    const f = filters.measureBetweenNotEqual(measures.sum(NumDim), 3, 7);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measures.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueB', 7);
  });
  test('filters.topRanking()', () => {
    const f = filters.topRanking(TextDim, measures.sum(NumDim), 3);
    expect(f).toBeInstanceOf(RankingFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('measure', measures.sum(NumDim));
    expect(f).toHaveProperty('operator', RankingOperators.Top);
    expect(f).toHaveProperty('count', 3);
  });
  test('filters.bottomRanking()', () => {
    const f = filters.bottomRanking(TextDim, measures.sum(NumDim), 3);
    expect(f).toBeInstanceOf(RankingFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('measure', measures.sum(NumDim));
    expect(f).toHaveProperty('operator', RankingOperators.Bottom);
    expect(f).toHaveProperty('count', 3);
  });
});
