/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { measureFactory } from '../../index.js';
import { createDimension, createDateDimension } from '../dimensions.js';
import * as filterFactory from './factory.js';
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

describe('filterFactory', () => {
  test('filterFactory.union()', () => {
    const f = filterFactory.union([filter1, filter2]);
    expect(f).toBeInstanceOf(LogicalAttributeFilter);
    expect(f).toHaveProperty('operator', LogicalOperators.Union);
    expect(f).toHaveProperty('filters', [filter1, filter2]);
  });
  test('filterFactory.intersection()', () => {
    const f = filterFactory.intersection([filter1, filter2]);
    expect(f).toBeInstanceOf(LogicalAttributeFilter);
    expect(f).toHaveProperty('operator', LogicalOperators.Intersection);
    expect(f).toHaveProperty('filters', [filter1, filter2]);
  });
  test('filterFactory.exclude()', () => {
    const f = filterFactory.exclude(filter1);
    expect(f).toBeInstanceOf(ExcludeFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('filter', filter1);
  });
  test('filterFactory.doesntContain()', () => {
    const f = filterFactory.doesntContain(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntContain);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filterFactory.doesntEndWith()', () => {
    const f = filterFactory.doesntEndWith(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntEndWith);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filterFactory.doesntStartWith()', () => {
    const f = filterFactory.doesntStartWith(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntStartWith);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filterFactory.contains()', () => {
    const f = filterFactory.contains(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.Contains);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filterFactory.endsWith()', () => {
    const f = filterFactory.endsWith(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.EndsWith);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filterFactory.startsWith()', () => {
    const f = filterFactory.startsWith(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.StartsWith);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filterFactory.like()', () => {
    const f = filterFactory.like(TextDim, '%mem%');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.Like);
    expect(f).toHaveProperty('valueA', '%mem%');
  });
  test('filterFactory.doesntEqual() with string arg', () => {
    const f = filterFactory.doesntEqual(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntEqual);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filterFactory.doesntEqual() with numeric arg', () => {
    const f = filterFactory.doesntEqual(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.DoesntEqual);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.equals() with string arg', () => {
    const f = filterFactory.equals(TextDim, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('operatorA', TextOperators.Equals);
    expect(f).toHaveProperty('valueA', 'mem');
  });
  test('filterFactory.equals() with numeric arg', () => {
    const f = filterFactory.equals(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.Equals);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.greaterThan()', () => {
    const f = filterFactory.greaterThan(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.greaterThanOrEqual()', () => {
    const f = filterFactory.greaterThanOrEqual(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.lessThan()', () => {
    const f = filterFactory.lessThan(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.lessThanOrEqual()', () => {
    const f = filterFactory.lessThanOrEqual(NumDim, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.To);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.between()', () => {
    const f = filterFactory.between(NumDim, 3, 7);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.To);
    expect(f).toHaveProperty('valueB', 7);
  });
  test('filterFactory.betweenNotEqual()', () => {
    const f = filterFactory.betweenNotEqual(NumDim, 3, 7);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueB', 7);
  });
  test('filterFactory.numeric()', () => {
    const f = filterFactory.numeric(NumDim, NumericOperators.Equals, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('operatorA', NumericOperators.Equals);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.members()', () => {
    const f = filterFactory.members(TextDim, ['mem1', 'mem2']);
    expect(f).toBeInstanceOf(MembersFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('members', ['mem1', 'mem2']);
  });
  test('filterFactory.dateFrom()', () => {
    const f = filterFactory.dateFrom(DateDim.Years, '2020-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('operatorA', DateOperators.From);
    expect(f).toHaveProperty('valueA', '2020-02-02T00:00:00Z');
  });
  test('filterFactory.dateTo()', () => {
    const f = filterFactory.dateTo(DateDim.Years, '2020-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('operatorB', DateOperators.To);
    expect(f).toHaveProperty('valueB', '2020-02-02T00:00:00Z');
  });
  test('filterFactory.dateRange()', () => {
    const f = filterFactory.dateRange(
      DateDim.Years,
      '2020-02-02T00:00:00Z',
      '2021-02-02T00:00:00Z',
    );
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('operatorA', DateOperators.From);
    expect(f).toHaveProperty('valueA', '2020-02-02T00:00:00Z');
    expect(f).toHaveProperty('operatorB', DateOperators.To);
    expect(f).toHaveProperty('valueB', '2021-02-02T00:00:00Z');
  });
  test('filterFactory.dateRelative()', () => {
    const f = filterFactory.dateRelative(DateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Next);
  });
  test('filterFactory.dateRelativeFrom()', () => {
    const f = filterFactory.dateRelativeFrom(DateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('operator', DateOperators.Next);
  });
  test('filterFactory.dateRelativeTo()', () => {
    const f = filterFactory.dateRelativeTo(DateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filterFactory.thisYear()', () => {
    const f = filterFactory.thisYear(DateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filterFactory.thisMonth()', () => {
    const f = filterFactory.thisMonth(DateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Months);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filterFactory.thisQuarter()', () => {
    const f = filterFactory.thisQuarter(DateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Quarters);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filterFactory.today()', () => {
    const f = filterFactory.today(DateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', DateDim.Days);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
  });
  test('filterFactory.measureBase()', () => {
    const f = filterFactory.measureBase(
      NumDim,
      measureFactory.sum(NumDim),
      NumericOperators.From,
      5,
    );
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measureFactory.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.measureGreaterThanOrEqual()', () => {
    const f = filterFactory.measureGreaterThanOrEqual(measureFactory.sum(NumDim), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measureFactory.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.measureLessThanOrEqual()', () => {
    const f = filterFactory.measureLessThanOrEqual(measureFactory.sum(NumDim), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measureFactory.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.To);
    expect(f).toHaveProperty('valueA', 5);
  });
  test('filterFactory.measureBetween()', () => {
    const f = filterFactory.measureBetween(measureFactory.sum(NumDim), 3, 7);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measureFactory.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.To);
    expect(f).toHaveProperty('valueB', 7);
  });
  test('filterFactory.measureBetweenNotEqual()', () => {
    const f = filterFactory.measureBetweenNotEqual(measureFactory.sum(NumDim), 3, 7);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', NumDim);
    expect(f).toHaveProperty('measure', measureFactory.sum(NumDim));
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueB', 7);
  });
  test('filterFactory.topRanking()', () => {
    const f = filterFactory.topRanking(TextDim, measureFactory.sum(NumDim), 3);
    expect(f).toBeInstanceOf(RankingFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('measure', measureFactory.sum(NumDim));
    expect(f).toHaveProperty('operator', RankingOperators.Top);
    expect(f).toHaveProperty('count', 3);
  });
  test('filterFactory.bottomRanking()', () => {
    const f = filterFactory.bottomRanking(TextDim, measureFactory.sum(NumDim), 3);
    expect(f).toBeInstanceOf(RankingFilter);
    expect(f).toHaveProperty('attribute', TextDim);
    expect(f).toHaveProperty('measure', measureFactory.sum(NumDim));
    expect(f).toHaveProperty('operator', RankingOperators.Bottom);
    expect(f).toHaveProperty('count', 3);
  });
  test('filterFactory.logic.and()', () => {
    const f = filterFactory.logic.and(filter1, filter2);
    expect(f).toHaveProperty('operator', 'AND');
    expect(f).toHaveProperty('left', filter1);
    expect(f).toHaveProperty('right', filter2);
  });
  test('filterFactory.logic.and() with array', () => {
    const f = filterFactory.logic.and([filter1, filter2], filter2);
    expect(f).toHaveProperty('operator', 'AND');
    expect(f).toHaveProperty('left', { operator: 'AND', left: filter1, right: filter2 });
    expect(f).toHaveProperty('right', filter2);
  });
  test('filterFactory.logic.or()', () => {
    const f = filterFactory.logic.or(filter1, filter2);
    expect(f).toHaveProperty('operator', 'OR');
    expect(f).toHaveProperty('left', filter1);
    expect(f).toHaveProperty('right', filter2);
  });
  test('filterFactory.logic.or() with array', () => {
    const f = filterFactory.logic.or(filter1, [filter1, filter2]);
    expect(f).toHaveProperty('operator', 'OR');
    expect(f).toHaveProperty('left', filter1);
    expect(f).toHaveProperty('right', { operator: 'AND', left: filter1, right: filter2 });
  });
});
