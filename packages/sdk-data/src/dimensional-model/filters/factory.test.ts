import { createAttribute, DimensionalLevelAttribute } from '../attributes/attributes.js';
import * as attributeFactory from '../attributes/factory.js';
import { createDateDimension } from '../dimensions/index.js';
import { Filter } from '../interfaces.js';
import * as measureFactory from '../measures/factory.js';
import { DimensionalBaseMeasure } from '../measures/measures.js';
import { DateLevels } from '../types.js';
import * as filterFactory from './factory.js';
import {
  createFilter,
  DateOperators,
  DateRangeFilter,
  EmptyFilter,
  ExcludeFilter,
  LogicalAttributeFilter,
  LogicalOperators,
  MeasureFilter,
  MeasureRankingFilter,
  MembersFilter,
  NumericFilter,
  NumericOperators,
  RankingFilter,
  RankingOperators,
  RelativeDateFilter,
  TextFilter,
  TextOperators,
} from './filters.js';

const textAttr = createAttribute({
  name: 'text',
  type: 'text-attribute',
  expression: '[Table.Text]',
  dataSource: { title: 'Sample Database', live: false },
});
const numAttr = createAttribute({
  name: 'num',
  type: 'numeric-attribute',
  expression: '[Table.Num]',
  dataSource: { title: 'Sample Database', live: false },
});
const dateDim = createDateDimension({
  name: 'date',
  expression: '[Table.Date]',
  dataSource: { title: 'Sample Database', live: false },
});

const filter1 = filterFactory.members(textAttr, ['text1', 'text2']);
const filter2 = filterFactory.members(numAttr, ['1', '2', '3']);

describe('filterFactory calculated-dimension support', () => {
  const calcDim = attributeFactory.customFormula('Bucket', "IF([n] > 10, 'A', 'B')", {
    n: numAttr,
  });

  it('allows a calculated dimension to be used as a filter source attribute', () => {
    expect(() => filterFactory.members(calcDim, ['A'])).not.toThrow();
    expect(() => filterFactory.contains(calcDim, 'A')).not.toThrow();
    expect(() => filterFactory.greaterThan(calcDim, 1)).not.toThrow();
  });

  it('builds the expected filter types from a calculated dimension', () => {
    expect(filterFactory.members(calcDim, ['A'])).toBeInstanceOf(MembersFilter);
    expect(filterFactory.contains(calcDim, 'A')).toBeInstanceOf(TextFilter);
    expect(filterFactory.greaterThan(calcDim, 1)).toBeInstanceOf(NumericFilter);
  });

  it('still allows regular attributes', () => {
    expect(() => filterFactory.members(textAttr, ['text1'])).not.toThrow();
  });
});

describe('filterFactory', () => {
  const mockGuid = 'GUID';
  const config = { guid: mockGuid, disabled: true, locked: true };

  const testConfig = (f: Filter, expectedComposeCode: string | undefined) => {
    expect(f.config.guid).toBe(mockGuid);
    expect(f.config.disabled).toBe(true);
    expect(f.config.locked).toBe(true);
    expect(f.composeCode).toBe(expectedComposeCode);
  };

  test('filterFactory.union()', () => {
    const f = filterFactory.union([filter1, filter2]);
    expect(f).toBeInstanceOf(LogicalAttributeFilter);
    expect(f).toHaveProperty('operator', LogicalOperators.Union);
    expect(f).toHaveProperty('filters', [filter1, filter2]);

    const f2 = filterFactory.union([filter1, filter2], config);
    testConfig(
      f2,
      `filterFactory.union([filterFactory.members(DM.Table.Text, ['text1', 'text2']), filterFactory.members(DM.Table.Num, ['1', '2', '3'])], { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.intersection()', () => {
    const f = filterFactory.intersection([filter1, filter2]);
    expect(f).toBeInstanceOf(LogicalAttributeFilter);
    expect(f).toHaveProperty('operator', LogicalOperators.Intersection);
    expect(f).toHaveProperty('filters', [filter1, filter2]);

    const f2 = filterFactory.intersection([filter1, filter2], config);
    testConfig(
      f2,
      `filterFactory.intersection([filterFactory.members(DM.Table.Text, ['text1', 'text2']), filterFactory.members(DM.Table.Num, ['1', '2', '3'])], { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.exclude()', () => {
    const f = filterFactory.exclude(filter1);
    expect(f).toBeInstanceOf(ExcludeFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('filter', filter1);

    const f2 = filterFactory.exclude(filter1, undefined, config);
    testConfig(
      f2,
      `filterFactory.exclude(filterFactory.members(DM.Table.Text, ['text1', 'text2']), undefined, { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.doesntContain()', () => {
    const f = filterFactory.doesntContain(textAttr, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntContain);
    expect(f).toHaveProperty('valueA', 'mem');

    const f2 = filterFactory.doesntContain(textAttr, 'mem', config);
    testConfig(
      f2,
      `filterFactory.doesntContain(DM.Table.Text, 'mem', { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.doesntEndWith()', () => {
    const f = filterFactory.doesntEndWith(textAttr, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntEndWith);
    expect(f).toHaveProperty('valueA', 'mem');

    const f2 = filterFactory.doesntEndWith(textAttr, 'mem', config);
    testConfig(
      f2,
      `filterFactory.doesntEndWith(DM.Table.Text, 'mem', { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.doesntStartWith()', () => {
    const f = filterFactory.doesntStartWith(textAttr, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntStartWith);
    expect(f).toHaveProperty('valueA', 'mem');

    const f2 = filterFactory.doesntStartWith(textAttr, 'mem', config);
    testConfig(
      f2,
      `filterFactory.doesntStartWith(DM.Table.Text, 'mem', { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.contains()', () => {
    const f = filterFactory.contains(textAttr, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.Contains);
    expect(f).toHaveProperty('valueA', 'mem');

    const f2 = filterFactory.contains(textAttr, 'mem', config);
    testConfig(
      f2,
      `filterFactory.contains(DM.Table.Text, 'mem', { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.endsWith()', () => {
    const f = filterFactory.endsWith(textAttr, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.EndsWith);
    expect(f).toHaveProperty('valueA', 'mem');

    const f2 = filterFactory.endsWith(textAttr, 'mem', config);
    testConfig(
      f2,
      `filterFactory.endsWith(DM.Table.Text, 'mem', { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.startsWith()', () => {
    const f = filterFactory.startsWith(textAttr, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.StartsWith);
    expect(f).toHaveProperty('valueA', 'mem');

    const f2 = filterFactory.startsWith(textAttr, 'mem', config);
    testConfig(
      f2,
      `filterFactory.startsWith(DM.Table.Text, 'mem', { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.like()', () => {
    const f = filterFactory.like(textAttr, '%mem%');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.Like);
    expect(f).toHaveProperty('valueA', '%mem%');

    const f2 = filterFactory.like(textAttr, '%mem%', config);
    testConfig(f2, `filterFactory.like(DM.Table.Text, '%mem%', { disabled: true, locked: true })`);
  });
  test('filterFactory.doesntEqual() with string arg', () => {
    const f = filterFactory.doesntEqual(textAttr, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.DoesntEqual);
    expect(f).toHaveProperty('valueA', 'mem');

    const f2 = filterFactory.doesntEqual(textAttr, 'mem', config);
    testConfig(
      f2,
      `filterFactory.doesntEqual(DM.Table.Text, 'mem', { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.doesntEqual() with numeric arg', () => {
    const f = filterFactory.doesntEqual(numAttr, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.DoesntEqual);
    expect(f).toHaveProperty('valueA', 5);

    const f2 = filterFactory.doesntEqual(numAttr, 5, config);
    testConfig(f2, `filterFactory.doesntEqual(DM.Table.Num, 5, { disabled: true, locked: true })`);
  });
  test('filterFactory.isEmpty()', () => {
    const f = filterFactory.isEmpty(textAttr);
    expect(f).toBeInstanceOf(EmptyFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('not', false);
    expect(f.filterJaql()).toEqual({ equals: '', isEmpty: true });

    const f2 = filterFactory.isEmpty(textAttr, config);
    testConfig(f2, `filterFactory.isEmpty(DM.Table.Text, { disabled: true, locked: true })`);
  });
  test('filterFactory.isNotEmpty()', () => {
    const f = filterFactory.isNotEmpty(textAttr);
    expect(f).toBeInstanceOf(EmptyFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('not', true);
    expect(f.filterJaql()).toEqual({ doesntEqual: '', isEmpty: true });

    const f2 = filterFactory.isNotEmpty(textAttr, config);
    testConfig(f2, `filterFactory.isNotEmpty(DM.Table.Text, { disabled: true, locked: true })`);
  });
  test('filterFactory.isEmpty()/isNotEmpty() round-trip through serialize/createFilter', () => {
    [filterFactory.isEmpty(textAttr), filterFactory.isNotEmpty(textAttr)].forEach((original) => {
      const restored = createFilter(original.serialize());
      expect(restored).toBeInstanceOf(EmptyFilter);
      expect(restored.filterJaql()).toEqual(original.filterJaql());
    });
  });
  test('filterFactory.equals() with string arg', () => {
    const f = filterFactory.equals(textAttr, 'mem');
    expect(f).toBeInstanceOf(TextFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('operatorA', TextOperators.Equals);
    expect(f).toHaveProperty('valueA', 'mem');

    const f2 = filterFactory.equals(textAttr, 'mem', config);
    testConfig(f2, `filterFactory.equals(DM.Table.Text, 'mem', { disabled: true, locked: true })`);
  });

  test('filterFactory.equals() with numeric arg', () => {
    const f = filterFactory.equals(numAttr, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.Equals);
    expect(f).toHaveProperty('valueA', 5);

    const f2 = filterFactory.equals(numAttr, 5, config);
    testConfig(f2, `filterFactory.equals(DM.Table.Num, 5, { disabled: true, locked: true })`);
  });

  test('filterFactory.greaterThan()', () => {
    const f = filterFactory.greaterThan(numAttr, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 5);
    const f2 = filterFactory.greaterThan(numAttr, 5, config);
    testConfig(f2, `filterFactory.greaterThan(DM.Table.Num, 5, { disabled: true, locked: true })`);
  });
  test('filterFactory.greaterThanOrEqual()', () => {
    const f = filterFactory.greaterThanOrEqual(numAttr, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);
    const f2 = filterFactory.greaterThanOrEqual(numAttr, 5, config);
    testConfig(
      f2,
      `filterFactory.greaterThanOrEqual(DM.Table.Num, 5, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.lessThan()', () => {
    const f = filterFactory.lessThan(numAttr, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueA', 5);
    const f2 = filterFactory.lessThan(numAttr, 5, config);
    testConfig(f2, `filterFactory.lessThan(DM.Table.Num, 5, { disabled: true, locked: true })`);
  });
  test('filterFactory.lessThanOrEqual()', () => {
    const f = filterFactory.lessThanOrEqual(numAttr, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.To);
    expect(f).toHaveProperty('valueA', 5);
    const f2 = filterFactory.lessThanOrEqual(numAttr, 5, config);
    testConfig(
      f2,
      `filterFactory.lessThanOrEqual(DM.Table.Num, 5, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.between()', () => {
    const f = filterFactory.between(numAttr, 3, 7);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.To);
    expect(f).toHaveProperty('valueB', 7);
    const f2 = filterFactory.between(numAttr, 3, 7, config);
    testConfig(f2, `filterFactory.between(DM.Table.Num, 3, 7, { disabled: true, locked: true })`);
  });
  test('filterFactory.betweenNotEqual()', () => {
    const f = filterFactory.betweenNotEqual(numAttr, 3, 7);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueB', 7);
    const f2 = filterFactory.betweenNotEqual(numAttr, 3, 7, config);
    testConfig(
      f2,
      `filterFactory.betweenNotEqual(DM.Table.Num, 3, 7, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.numeric()', () => {
    const f = filterFactory.numeric(numAttr, NumericOperators.Equals, 5);
    expect(f).toBeInstanceOf(NumericFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('operatorA', NumericOperators.Equals);
    expect(f).toHaveProperty('valueA', 5);
    const f2 = filterFactory.numeric(
      numAttr,
      NumericOperators.Equals,
      5,
      undefined,
      undefined,
      config,
    );
    testConfig(
      f2,
      `filterFactory.numeric(DM.Table.Num, 'equals', 5, undefined, undefined, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.members()', () => {
    const f = filterFactory.members(textAttr, ['mem1', 'mem2']);
    expect(f).toBeInstanceOf(MembersFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('members', ['mem1', 'mem2']);
    const f2 = filterFactory.members(textAttr, ['mem1', 'mem2'], config);
    testConfig(
      f2,
      `filterFactory.members(DM.Table.Text, ['mem1', 'mem2'], { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.members() with other config', () => {
    const f = filterFactory.members(textAttr, ['mem1', 'mem2'], {
      backgroundFilter: filterFactory.numeric(numAttr, NumericOperators.Equals, 5),
    });
    expect(f).toBeInstanceOf(MembersFilter);
    expect(f.filterJaql()).toBeDefined();
  });

  test('filterFactory.dateFrom()', () => {
    const f = filterFactory.dateFrom(dateDim.Years, '2020-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('operatorA', DateOperators.From);
    expect(f).toHaveProperty('valueA', '2020-02-02');
    const f2 = filterFactory.dateFrom(dateDim.Years, '2020-02-02T00:00:00Z', config);
    testConfig(
      f2,
      `filterFactory.dateFrom(DM.Table.Date.Years, '2020-02-02T00:00:00Z', { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.dateTo()', () => {
    const f = filterFactory.dateTo(dateDim.Years, '2020-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('operatorB', DateOperators.To);
    expect(f).toHaveProperty('valueB', '2020-02-02');

    const f2 = filterFactory.dateTo(dateDim.Years, '2020-02-02T00:00:00Z', config);
    testConfig(
      f2,
      `filterFactory.dateTo(DM.Table.Date.Years, '2020-02-02T00:00:00Z', { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.dateBefore() makes the upper bound exclusive', () => {
    const f = filterFactory.dateBefore(dateDim.Years, '2020-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('operatorB', DateOperators.ToNotEqual);
    expect(f).toHaveProperty('valueB', '2020-02-02');
    expect(f.filterJaql()).toStrictEqual({
      toNotEqual: '2020-02-02',
      isAdvanced: true,
      custom: true,
    });

    const f2 = filterFactory.dateBefore(dateDim.Years, '2020-02-02T00:00:00Z', config);
    testConfig(
      f2,
      `filterFactory.dateBefore(DM.Table.Date.Years, '2020-02-02T00:00:00Z', { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.dateAfter() makes the lower bound exclusive', () => {
    const f = filterFactory.dateAfter(dateDim.Years, '2020-02-02T00:00:00Z');
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('operatorA', DateOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', '2020-02-02');
    expect(f.filterJaql()).toStrictEqual({
      fromNotEqual: '2020-02-02',
      isAdvanced: true,
      custom: true,
    });

    const f2 = filterFactory.dateAfter(dateDim.Years, '2020-02-02T00:00:00Z', config);
    testConfig(
      f2,
      `filterFactory.dateAfter(DM.Table.Date.Years, '2020-02-02T00:00:00Z', { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.dateRange()', () => {
    const f = filterFactory.dateRange(
      dateDim.Years,
      '2020-02-02T00:00:00Z',
      '2021-02-02T00:00:00Z',
    );
    expect(f).toBeInstanceOf(DateRangeFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('operatorA', DateOperators.From);
    expect(f).toHaveProperty('valueA', '2020-02-02');
    expect(f).toHaveProperty('operatorB', DateOperators.To);
    expect(f).toHaveProperty('valueB', '2021-02-02');

    const f2 = filterFactory.dateRange(
      dateDim.Years,
      '2020-02-02T00:00:00Z',
      '2021-02-02T00:00:00Z',
      config,
    );
    testConfig(
      f2,
      `filterFactory.dateRange(DM.Table.Date.Years, '2020-02-02T00:00:00Z', '2021-02-02T00:00:00Z', { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.dateRelative()', () => {
    const f = filterFactory.dateRelative(dateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Next);

    const f2 = filterFactory.dateRelative(dateDim.Years, 0, 1, undefined, config);
    testConfig(
      f2,
      `filterFactory.dateRelative(DM.Table.Date.Years, 0, 1, undefined, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.dateRelativeFrom()', () => {
    const f = filterFactory.dateRelativeFrom(dateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('operator', DateOperators.Next);

    const f2 = filterFactory.dateRelativeFrom(dateDim.Years, 0, 1, undefined, config);
    testConfig(
      f2,
      `filterFactory.dateRelativeFrom(DM.Table.Date.Years, 0, 1, undefined, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.dateRelativeTo()', () => {
    const f = filterFactory.dateRelativeTo(dateDim.Years, 0, 1);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);
    const f2 = filterFactory.dateRelativeTo(dateDim.Years, 0, 1, undefined, config);
    testConfig(
      f2,
      `filterFactory.dateRelativeTo(DM.Table.Date.Years, 0, 1, undefined, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.thisYear()', () => {
    const f = filterFactory.thisYear(dateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', dateDim.Years);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);

    const f2 = filterFactory.thisYear(dateDim, config);
    testConfig(f2, `filterFactory.thisYear(DM.Table.Date, { disabled: true, locked: true })`);
  });
  test('filterFactory.thisMonth()', () => {
    const f = filterFactory.thisMonth(dateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', dateDim.Months);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);

    const f2 = filterFactory.thisMonth(dateDim, config);
    testConfig(f2, `filterFactory.thisMonth(DM.Table.Date, { disabled: true, locked: true })`);
  });
  test('filterFactory.thisQuarter()', () => {
    const f = filterFactory.thisQuarter(dateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', dateDim.Quarters);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);

    const f2 = filterFactory.thisQuarter(dateDim, config);
    testConfig(f2, `filterFactory.thisQuarter(DM.Table.Date, { disabled: true, locked: true })`);
  });
  test('filterFactory.today()', () => {
    const f = filterFactory.today(dateDim);
    expect(f).toBeInstanceOf(RelativeDateFilter);
    expect(f).toHaveProperty('attribute', dateDim.Days);
    expect(f).toHaveProperty('offset', 0);
    expect(f).toHaveProperty('count', 1);
    expect(f).toHaveProperty('operator', DateOperators.Last);

    const f2 = filterFactory.today(dateDim, config);
    testConfig(f2, `filterFactory.today(DM.Table.Date, { disabled: true, locked: true })`);
  });
  test('filterFactory.measureBase()', () => {
    const f = filterFactory.measureBase(
      numAttr,
      measureFactory.sum(numAttr),
      NumericOperators.From,
      5,
    );
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);

    const f2 = filterFactory.measureBase(
      numAttr,
      measureFactory.sum(numAttr),
      NumericOperators.From,
      5,
      undefined,
      undefined,
      config,
    );
    testConfig(f2, undefined);
  });
  test('filterFactory.measureEquals()', () => {
    const f = filterFactory.measureEquals(measureFactory.sum(numAttr), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operatorA', NumericOperators.Equals);
    expect(f).toHaveProperty('valueA', 5);

    const f2 = filterFactory.measureEquals(measureFactory.sum(numAttr), 5, config);
    testConfig(
      f2,
      `filterFactory.measureEquals(measureFactory.sum(DM.Table.Num), 5, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.measureGreaterThan()', () => {
    const f = filterFactory.measureGreaterThan(measureFactory.sum(numAttr), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 5);

    const f2 = filterFactory.measureGreaterThan(measureFactory.sum(numAttr), 5, config);
    testConfig(
      f2,
      `filterFactory.measureGreaterThan(measureFactory.sum(DM.Table.Num), 5, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.measureLessThan()', () => {
    const f = filterFactory.measureLessThan(measureFactory.sum(numAttr), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operatorA', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueA', 5);

    const f2 = filterFactory.measureLessThan(measureFactory.sum(numAttr), 5, config);
    testConfig(
      f2,
      `filterFactory.measureLessThan(measureFactory.sum(DM.Table.Num), 5, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.measureGreaterThanOrEqual()', () => {
    const f = filterFactory.measureGreaterThanOrEqual(measureFactory.sum(numAttr), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 5);

    const f2 = filterFactory.measureGreaterThanOrEqual(measureFactory.sum(numAttr), 5, config);
    testConfig(
      f2,
      `filterFactory.measureGreaterThanOrEqual(measureFactory.sum(DM.Table.Num), 5, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.measureGreaterThanOrEqual() with customFormula', () => {
    const customMeasure = measureFactory.customFormula('AOV', '[m1] / [m2]', {
      m1: measureFactory.sum(numAttr, 'sum num'),
      m2: measureFactory.count(numAttr, 'count num'),
    });
    const f = filterFactory.measureGreaterThanOrEqual(customMeasure, 50);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', customMeasure);
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 50);
  });
  test('filterFactory.measureLessThanOrEqual()', () => {
    const f = filterFactory.measureLessThanOrEqual(measureFactory.sum(numAttr), 5);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operatorA', NumericOperators.To);
    expect(f).toHaveProperty('valueA', 5);

    const f2 = filterFactory.measureLessThanOrEqual(measureFactory.sum(numAttr), 5, config);
    testConfig(
      f2,
      `filterFactory.measureLessThanOrEqual(measureFactory.sum(DM.Table.Num), 5, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.measureBetween()', () => {
    const f = filterFactory.measureBetween(measureFactory.sum(numAttr), 3, 7);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operatorA', NumericOperators.From);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.To);
    expect(f).toHaveProperty('valueB', 7);

    const f2 = filterFactory.measureBetween(measureFactory.sum(numAttr), 3, 7, config);
    testConfig(
      f2,
      `filterFactory.measureBetween(measureFactory.sum(DM.Table.Num), 3, 7, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.measureBetweenNotEqual()', () => {
    const f = filterFactory.measureBetweenNotEqual(measureFactory.sum(numAttr), 3, 7);
    expect(f).toBeInstanceOf(MeasureFilter);
    expect(f).toHaveProperty('attribute', numAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operatorA', NumericOperators.FromNotEqual);
    expect(f).toHaveProperty('valueA', 3);
    expect(f).toHaveProperty('operatorB', NumericOperators.ToNotEqual);
    expect(f).toHaveProperty('valueB', 7);

    const f2 = filterFactory.measureBetweenNotEqual(measureFactory.sum(numAttr), 3, 7, config);
    testConfig(
      f2,
      `filterFactory.measureBetweenNotEqual(measureFactory.sum(DM.Table.Num), 3, 7, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.topRanking()', () => {
    const f = filterFactory.topRanking(textAttr, measureFactory.sum(numAttr), 3);
    expect(f).toBeInstanceOf(RankingFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operator', RankingOperators.Top);
    expect(f).toHaveProperty('count', 3);

    const f2 = filterFactory.topRanking(textAttr, measureFactory.sum(numAttr), 3, config);
    testConfig(
      f2,
      `filterFactory.topRanking(DM.Table.Text, measureFactory.sum(DM.Table.Num), 3, { disabled: true, locked: true })`,
    );
  });
  test('filterFactory.bottomRanking()', () => {
    const f = filterFactory.bottomRanking(textAttr, measureFactory.sum(numAttr), 3);
    expect(f).toBeInstanceOf(RankingFilter);
    expect(f).toHaveProperty('attribute', textAttr);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operator', RankingOperators.Bottom);
    expect(f).toHaveProperty('count', 3);

    const f2 = filterFactory.bottomRanking(textAttr, measureFactory.sum(numAttr), 3, config);
    testConfig(
      f2,
      `filterFactory.bottomRanking(DM.Table.Text, measureFactory.sum(DM.Table.Num), 3, { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.measureTopRanking()', () => {
    const f = filterFactory.measureTopRanking(measureFactory.sum(numAttr), 3);
    expect(f).toBeInstanceOf(MeasureRankingFilter);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operator', RankingOperators.Top);
    expect(f).toHaveProperty('count', 3);

    const f2 = filterFactory.measureTopRanking(measureFactory.sum(numAttr), 3, config);
    testConfig(
      f2,
      `filterFactory.measureTopRanking(measureFactory.sum(DM.Table.Num), 3, { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.measureBottomRanking()', () => {
    const f = filterFactory.measureBottomRanking(measureFactory.sum(numAttr), 3);
    expect(f).toBeInstanceOf(MeasureRankingFilter);
    expect(f).toHaveProperty('measure', measureFactory.sum(numAttr));
    expect(f).toHaveProperty('operator', RankingOperators.Bottom);
    expect(f).toHaveProperty('count', 3);

    const f2 = filterFactory.measureBottomRanking(measureFactory.sum(numAttr), 3, config);
    testConfig(
      f2,
      `filterFactory.measureBottomRanking(measureFactory.sum(DM.Table.Num), 3, { disabled: true, locked: true })`,
    );
  });

  test('filterFactory.logic.and()', () => {
    const f = filterFactory.logic.and(filter1, filter2);
    expect(f).toHaveProperty('operator', 'AND');
    expect(f).toHaveProperty('left', filter1);
    expect(f).toHaveProperty('right', filter2);
    expect(f.composeCode).toBe(
      `filterFactory.logic.and(filterFactory.members(DM.Table.Text, ['text1', 'text2']), filterFactory.members(DM.Table.Num, ['1', '2', '3']))`,
    );
  });
  test('filterFactory.logic.and() with array', () => {
    const f = filterFactory.logic.and([filter1, filter2], filter2);
    expect(f).toHaveProperty('operator', 'AND');
    expect(f).toHaveProperty('left', { operator: 'AND', left: filter1, right: filter2 });
    expect(f).toHaveProperty('right', filter2);
    expect(f.composeCode).toBe(
      `filterFactory.logic.and([filterFactory.members(DM.Table.Text, ['text1', 'text2']), filterFactory.members(DM.Table.Num, ['1', '2', '3'])], filterFactory.members(DM.Table.Num, ['1', '2', '3']))`,
    );
  });
  test('filterFactory.logic.or()', () => {
    const f = filterFactory.logic.or(filter1, filter2);
    expect(f).toHaveProperty('operator', 'OR');
    expect(f).toHaveProperty('left', filter1);
    expect(f).toHaveProperty('right', filter2);
    expect(f.composeCode).toBe(
      `filterFactory.logic.or(filterFactory.members(DM.Table.Text, ['text1', 'text2']), filterFactory.members(DM.Table.Num, ['1', '2', '3']))`,
    );
  });
  test('filterFactory.logic.or() with array', () => {
    const f = filterFactory.logic.or(filter1, [filter1, filter2]);
    expect(f).toHaveProperty('operator', 'OR');
    expect(f).toHaveProperty('left', filter1);
    expect(f).toHaveProperty('right', { operator: 'AND', left: filter1, right: filter2 });
    expect(f.composeCode).toBe(
      `filterFactory.logic.or(filterFactory.members(DM.Table.Text, ['text1', 'text2']), [filterFactory.members(DM.Table.Text, ['text1', 'text2']), filterFactory.members(DM.Table.Num, ['1', '2', '3'])])`,
    );
  });
});

/* Every expected string below is written out in full. A test that rebuilds it from a `Date` would
   pass in any timezone while proving nothing, and these values are what goes on the wire. */
describe('measure filters with a date value', () => {
  const dateMeasure = measureFactory.max(dateDim.Days, 'Last order');
  const numericMeasure = measureFactory.sum(numAttr, 'sum num');

  // no `Z`, so these parse as local time and the expected strings hold in every timezone
  const from = new Date('2013-12-01T00:00:00');
  const to = new Date('2013-12-31T23:59:59');
  const FROM = '2013-12-01T00:00:00';
  const TO = '2013-12-31T23:59:59';

  /* Shapes our serializer can never emit: it never writes a `Z`, an offset or milliseconds. Assert
     pass-through with these, or the test cannot tell it from parse-and-re-serialize. */
  const FOREIGN_FROM = '2013-10-01T00:00:00.123Z';
  const FOREIGN_TO = '2013-12-31T23:59:59+05:30';

  /** The filter values as the server receives them, without depending on the operator names. */
  const wireValues = (f: Filter) =>
    Object.values((f.jaql().jaql as { filter: Record<string, unknown> }).filter);

  describe.each([
    ['measureEquals', filterFactory.measureEquals],
    ['measureGreaterThan', filterFactory.measureGreaterThan],
    ['measureGreaterThanOrEqual', filterFactory.measureGreaterThanOrEqual],
    ['measureLessThanOrEqual', filterFactory.measureLessThanOrEqual],
    ['measureLessThan', filterFactory.measureLessThan],
  ] as const)('filterFactory.%s()', (_name, build) => {
    test('serializes a Date to a local ISO string with no Z', () => {
      const f = build(dateMeasure, from);
      expect(f).toHaveProperty('valueA', FROM);
      expect(wireValues(f)).toEqual([FROM]);
    });

    test('passes an ISO string through byte for byte', () => {
      const f = build(dateMeasure, FOREIGN_FROM);
      expect(f).toHaveProperty('valueA', FOREIGN_FROM);
      expect(wireValues(f)).toEqual([FOREIGN_FROM]);
    });

    test('a number is unchanged', () => {
      const f = build(numericMeasure, 5);
      expect(f).toHaveProperty('valueA', 5);
      expect(wireValues(f)).toEqual([5]);
    });
  });

  describe.each([
    ['measureBetween', filterFactory.measureBetween],
    ['measureBetweenNotEqual', filterFactory.measureBetweenNotEqual],
  ] as const)('filterFactory.%s()', (_name, build) => {
    test('serializes both Dates to local ISO strings with no Z', () => {
      const f = build(dateMeasure, from, to);
      expect(f).toHaveProperty('valueA', FROM);
      expect(f).toHaveProperty('valueB', TO);
      expect(wireValues(f)).toEqual([FROM, TO]);
    });

    test('passes both ISO strings through byte for byte', () => {
      const f = build(dateMeasure, FOREIGN_FROM, FOREIGN_TO);
      expect(f).toHaveProperty('valueA', FOREIGN_FROM);
      expect(f).toHaveProperty('valueB', FOREIGN_TO);
      expect(wireValues(f)).toEqual([FOREIGN_FROM, FOREIGN_TO]);
    });

    test('two numbers are unchanged', () => {
      const f = build(numericMeasure, 3, 7);
      expect(f).toHaveProperty('valueA', 3);
      expect(f).toHaveProperty('valueB', 7);
      expect(wireValues(f)).toEqual([3, 7]);
    });
  });

  test('a numeric measure filter emits exactly the JAQL it emitted before', () => {
    expect(filterFactory.measureBetween(numericMeasure, 3, 7).jaql()).toEqual({
      jaql: {
        title: 'sum num',
        dim: '[Table.Num]',
        datatype: 'numeric',
        agg: 'sum',
        filter: { from: 3, to: 7 },
        datasource: { title: 'Sample Database', live: false },
      },
      panel: 'scope',
    });
  });

  test('a Date reaches the server as local midnight, not as the UTC instant', () => {
    const f = filterFactory.measureGreaterThan(dateMeasure, from);
    expect(wireValues(f)).toEqual([FROM]);
    expect(JSON.stringify(f.jaql().jaql.filter)).not.toContain('Z');
  });

  test('rejects an invalid Date instead of serializing NaN onto the wire', () => {
    expect(() => filterFactory.measureGreaterThan(dateMeasure, new Date('nonsense'))).toThrow(
      'Filter date value is an invalid Date',
    );

    // the valid neighbour still builds, so the guard is not rejecting every Date
    expect(filterFactory.measureGreaterThan(dateMeasure, from)).toHaveProperty('valueA', FROM);
  });

  test('pads a year below 1000 to four digits', () => {
    // setFullYear, not a literal: `new Date('0999-06-15')` is parsed as UTC and shifts the day
    const early = new Date('2013-06-15T00:00:00');
    early.setFullYear(999);

    expect(filterFactory.measureGreaterThan(dateMeasure, early)).toHaveProperty(
      'valueA',
      '0999-06-15T00:00:00',
    );
  });

  test('a Date survives serialize and createFilter as the same string', () => {
    const f = filterFactory.measureGreaterThan(dateMeasure, from);
    expect(createFilter(f.serialize())).toHaveProperty('valueA', FROM);
  });
});

describe('measure filters over a formula measure', () => {
  const dateDimension = createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
  });
  const cost = createAttribute({
    name: 'Cost',
    type: 'numeric-attribute',
    expression: '[Commerce.Cost]',
  });
  const category = createAttribute({
    name: 'Category',
    type: 'text-attribute',
    expression: '[Category.Category]',
  });
  const bareOnly = measureFactory.customFormula('Inner', '[d]', { d: dateDimension.Days });
  const visits = measureFactory.count(
    createAttribute({
      name: 'VisitID',
      type: 'numeric-attribute',
      expression: '[Commerce.VisitID]',
    }),
    'Visits',
  );
  /* An attribute, not a measure, but it carries a context exactly like a calculated measure. */
  const margin = attributeFactory.customFormula('Margin', '[r] - [c]', {
    r: createAttribute({
      name: 'Revenue',
      type: 'numeric-attribute',
      expression: '[Commerce.Revenue]',
    }),
    c: cost,
  });

  it('resolves the attribute from a bare operand, the shape Fusion writes', () => {
    const formula = measureFactory.customFormula('Last sale', 'MAX([D])', {
      D: dateDimension.Days,
    });

    expect(filterFactory.measureEquals(formula, 1).attribute).toBe(dateDimension.Days);
  });

  it('still resolves the attribute from a nested measure operand', () => {
    const nested = measureFactory.customFormula('Wrapped', 'SUM([M])', {
      M: measureFactory.max(dateDimension.Days, 'Max Date'),
    });

    expect(filterFactory.measureEquals(nested, 1).attribute).toBe(dateDimension.Days);
  });

  it('prefers a nested measure over a bare operand listed before it', () => {
    const formula = measureFactory.customFormula('Mixed', '[c] / [v]', { c: cost, v: visits });

    expect(filterFactory.measureEquals(formula, 1).attribute.expression).toBe('[Commerce.VisitID]');
  });

  it('prefers a filter operand over a bare operand listed before it', () => {
    const formula = measureFactory.customFormula('Total Cost with Filter', '(SUM([c]), [f])', {
      c: cost,
      f: filterFactory.members(category, ['Apple Mac Desktops']),
    });

    expect(filterFactory.measureEquals(formula, 1).attribute.expression).toBe(
      '[Category.Category]',
    );
  });

  it('prefers a measure two levels down over a nested formula holding only a bare attribute', () => {
    const deep = measureFactory.customFormula('Middle', 'SUM([m])', {
      m: measureFactory.sum(cost, 'Total Cost'),
    });
    const outer = measureFactory.customFormula('Outer', '[a] / [b]', { a: bareOnly, b: deep });

    expect(filterFactory.measureEquals(outer, 1).attribute.expression).toBe('[Commerce.Cost]');
  });

  it('prefers a direct measure over a nested formula holding only a bare attribute', () => {
    const outer = measureFactory.customFormula('Outer', '[a] / [b]', {
      a: bareOnly,
      b: measureFactory.sum(cost, 'Total Cost'),
    });

    expect(filterFactory.measureEquals(outer, 1).attribute.expression).toBe('[Commerce.Cost]');
  });

  it('prefers a filter operand over a nested formula holding only a bare attribute', () => {
    const outer = measureFactory.customFormula('Outer', '([a], [f])', {
      a: bareOnly,
      f: filterFactory.members(category, ['Apple Mac Desktops']),
    });

    expect(filterFactory.measureEquals(outer, 1).attribute.expression).toBe('[Category.Category]');
  });

  it('falls back to a bare attribute nested inside a formula when nothing else carries one', () => {
    const outer = measureFactory.customFormula('Outer', '[a]', { a: bareOnly });

    expect(filterFactory.measureEquals(outer, 1).attribute).toBe(dateDimension.Days);
  });

  it('keeps the bare attribute listed first over one nested in a later operand', () => {
    const outer = measureFactory.customFormula('Outer', '[c] / [a]', { c: cost, a: bareOnly });

    expect(filterFactory.measureEquals(outer, 1).attribute.expression).toBe('[Commerce.Cost]');
  });

  it('answers with a calculated attribute operand, not with something inside it', () => {
    const outer = measureFactory.customFormula('Outer', '[a]', { a: margin });

    expect(filterFactory.measureEquals(outer, 1).attribute.expression).toBe('[r] - [c]');
  });

  it('keeps a calculated attribute over a bare attribute listed after it', () => {
    const outer = measureFactory.customFormula('Outer', '[a] / [c]', { a: margin, c: cost });

    expect(filterFactory.measureEquals(outer, 1).attribute.expression).toBe('[r] - [c]');
  });

  it('prefers a measure operand over a calculated attribute listed before it', () => {
    const outer = measureFactory.customFormula('Outer', '[a] / [v]', { a: margin, v: visits });

    expect(filterFactory.measureEquals(outer, 1).attribute.expression).toBe('[Commerce.VisitID]');
  });

  it('prefers a filter operand over a calculated attribute listed before it', () => {
    const outer = measureFactory.customFormula('Outer', '([a], [f])', {
      a: margin,
      f: filterFactory.members(category, ['Apple Mac Desktops']),
    });

    expect(filterFactory.measureEquals(outer, 1).attribute.expression).toBe('[Category.Category]');
  });

  it('still throws when no operand carries an attribute', () => {
    const empty = measureFactory.customFormula('Nothing', '1 + 1', {});

    expect(() => filterFactory.measureEquals(empty, 1)).toThrow(
      'Cannot determine attribute from measure',
    );
  });
});

/* The filter level and the measure's own operand level are different inputs. Getting that wrong
   returns zero rows from the server rather than an error, so every case here asserts both. */
describe('measure filters on a date measure', () => {
  const lastOrder = measureFactory.max(dateDim.Days, 'Last Order');
  const revenue = measureFactory.sum(numAttr, 'Revenue');
  const shipDim = createDateDimension({ name: 'ship', expression: '[Table.ShipDate]' });
  const itemOf = (filter: Filter) => filter.jaql().jaql;

  it('matches members at the level given, not at the level inside the measure', () => {
    const item = itemOf(
      filterFactory.dateMeasureMembers(lastOrder, dateDim.Years, ['2013-01-01T00:00:00']),
    );

    expect(item.level).toBe('years');
    expect(lastOrder.jaql().jaql.level).toBe('days');
  });

  it('carries the measure keys, the datatype and the scope panel', () => {
    const filter = filterFactory.dateMeasureMembers(lastOrder, dateDim.Years, [
      '2013-01-01T00:00:00',
    ]);

    expect(itemOf(filter)).toMatchObject({
      dim: '[Table.Date]',
      agg: 'max',
      datatype: 'datetime',
      filter: { members: ['2013-01-01T00:00:00'] },
    });
    expect(filter.jaql().panel).toBe('scope');
  });

  it('negates the members through the config, in the exclude shape Fusion uses', () => {
    const item = itemOf(
      filterFactory.dateMeasureMembers(lastOrder, dateDim.Years, ['2013-01-01T00:00:00'], {
        excludeMembers: true,
      }),
    );

    expect(item.filter).toStrictEqual({ exclude: { members: ['2013-01-01T00:00:00'] } });
  });

  it('writes a Date member as a local datetime, with no Z to shift the day', () => {
    const item = itemOf(
      filterFactory.dateMeasureMembers(lastOrder, dateDim.Years, [new Date(2012, 0, 1)]),
    );

    expect(item.filter.members).toStrictEqual(['2012-01-01T00:00:00']);
  });

  it.each([
    ['dateMeasureRelativeFrom', filterFactory.dateMeasureRelativeFrom, 'next'],
    ['dateMeasureRelativeTo', filterFactory.dateMeasureRelativeTo, 'last'],
  ])('%s puts the period on the measure at the level given', (_name, build, operator) => {
    const item = itemOf(build(lastOrder, dateDim.Years, 0, 1, '2013-06-01'));

    expect(item.level).toBe('years');
    expect(item.agg).toBe('max');
    expect(item.filter).toStrictEqual({
      [operator]: { offset: 0, count: 1, anchor: '2013-06-01' },
    });
  });

  it('writes a Date anchor as a bare date, not as a timestamp', () => {
    const item = itemOf(
      filterFactory.dateMeasureRelativeTo(lastOrder, dateDim.Years, 0, 1, new Date(2013, 5, 1)),
    );

    expect(item.filter.last.anchor).toBe('2013-06-01');
  });

  it('offset 0 includes the anchor period and offset 1 excludes it', () => {
    const including = itemOf(filterFactory.dateMeasureRelativeTo(lastOrder, dateDim.Years, 0, 1));
    const excluding = itemOf(filterFactory.dateMeasureRelativeTo(lastOrder, dateDim.Years, 1, 1));

    expect(including.filter.last.offset).toBe(0);
    expect(excluding.filter.last.offset).toBe(1);
  });

  it.each([
    [
      'dateMeasureMembers',
      () => filterFactory.dateMeasureMembers(lastOrder, dateDim.Years, ['2013-01-01T00:00:00']),
    ],
    [
      'dateMeasureRelativeFrom',
      () => filterFactory.dateMeasureRelativeFrom(lastOrder, dateDim.Years, 0, 1, '2013-06-01'),
    ],
    [
      'dateMeasureRelativeTo',
      () => filterFactory.dateMeasureRelativeTo(lastOrder, dateDim.Years, 0, 1, '2013-06-01'),
    ],
  ])('%s stamps compose code that names it', (name, build) => {
    expect(build().composeCode).toContain(`filterFactory.${name}(`);
  });

  it.each([
    [
      'dateMeasureMembers',
      () => filterFactory.dateMeasureMembers(lastOrder, dateDim.Years, [new Date(2012, 0, 1)]),
    ],
    [
      'dateMeasureRelativeTo',
      () =>
        filterFactory.dateMeasureRelativeTo(lastOrder, dateDim.Years, 0, 1, new Date(2013, 5, 1)),
    ],
  ])('%s survives serialize and createFilter with the same jaql', (_name, build) => {
    const filter = build();

    expect(createFilter(filter.serialize()).jaql()).toStrictEqual(filter.jaql());
  });

  /* A measure that answers with a number cannot mean anything at a granularity, and this family
     forces the caller to pass one: datatype 'numeric' beside level 'years' contradicts itself. */
  it.each([
    [
      'dateMeasureMembers',
      () => filterFactory.dateMeasureMembers(revenue, dateDim.Years, ['2013-01-01T00:00:00']),
    ],
    [
      'dateMeasureRelativeTo',
      () => filterFactory.dateMeasureRelativeTo(revenue, dateDim.Years, 0, 1),
    ],
  ])('%s refuses a measure that is not a date measure', (_name, build) => {
    expect(build).toThrow(/is not a date measure/);
  });

  it('names the measure and the level it could not apply', () => {
    expect(() =>
      filterFactory.dateMeasureMembers(revenue, dateDim.Years, ['2013-01-01T00:00:00']),
    ).toThrow(/'Revenue'.*'Years'/);
  });

  /* The filter is built on the measure's own dim, so a level from elsewhere is silently discarded and
     the filter acts on the measure's dimension while still looking correct. */
  it.each([
    [
      'dateMeasureMembers',
      () => filterFactory.dateMeasureMembers(lastOrder, shipDim.Years, ['2013-01-01T00:00:00']),
    ],
    [
      'dateMeasureRelativeTo',
      () => filterFactory.dateMeasureRelativeTo(lastOrder, shipDim.Years, 0, 1),
    ],
  ])('%s refuses a level from another dimension', (_name, build) => {
    expect(build).toThrow(/\[Table\.ShipDate\][\s\S]*\[Table\.Date\]/);
  });

  it('allows a level from the measure own dimension', () => {
    expect(() =>
      filterFactory.dateMeasureMembers(lastOrder, dateDim.Years, ['2013-01-01T00:00:00']),
    ).not.toThrow();
  });

  /* An unresolvable dimension is skipped, not refused: a custom dimension or an
     alias must not start throwing on code the compiler never warned about. */
  it('says nothing when the level dimension cannot be resolved', () => {
    const unresolvable = new DimensionalLevelAttribute('Years', '', 'Years');

    expect(() =>
      filterFactory.dateMeasureMembers(lastOrder, unresolvable, ['2013-01-01T00:00:00']),
    ).not.toThrow();
  });

  /* A saved config keeps its backgroundFilter as plain JSON, and jaql() calls filterJaql() on it,
     so a rebuild that leaves it as JSON kills the whole widget query on reload. */
  it('rebuilds the background filter inside a saved config', () => {
    const filter = filterFactory.dateMeasureMembers(
      lastOrder,
      dateDim.Years,
      ['2013-01-01T00:00:00'],
      {
        backgroundFilter: filterFactory.members(textAttr, ['text1']),
      },
    );

    expect(() => createFilter(filter.serialize()).jaql()).not.toThrow();
  });

  /* The rebuild of a members filter reads no config, so an exclude background filter would come
     back as an include one and flip which rows the widget keeps. */
  it('keeps the background filter config through a round trip', () => {
    const filter = filterFactory.dateMeasureMembers(
      lastOrder,
      dateDim.Years,
      ['2013-01-01T00:00:00'],
      {
        backgroundFilter: filterFactory.members(textAttr, ['text1'], {
          excludeMembers: true,
          deactivatedMembers: ['text2'],
          guid: 'background-guid',
        }),
      },
    );

    const rebuilt = createFilter(filter.serialize()) as MembersFilter;
    const background = rebuilt.config.backgroundFilter as MembersFilter;

    expect(background.config.excludeMembers).toBe(true);
    expect(background.config.deactivatedMembers).toEqual(['text2']);
    expect(background.config.guid).toBe('background-guid');
    expect(background.filterJaql()).toEqual({ exclude: { members: ['text1'] } });
  });

  /* The saved config is plain JSON all the way down, so a background filter that has its own
     would be laid back on as JSON and filterJaql() would call a method it does not have. */
  it('rebuilds a nested background filter inside a saved config', () => {
    const filter = filterFactory.dateMeasureMembers(
      lastOrder,
      dateDim.Years,
      ['2013-01-01T00:00:00'],
      {
        backgroundFilter: filterFactory.members(textAttr, ['text1'], {
          backgroundFilter: filterFactory.members(numAttr, ['1']),
        }),
      },
    );

    const rebuilt = createFilter(filter.serialize()) as MembersFilter;
    const background = rebuilt.config.backgroundFilter as MembersFilter;

    expect(background.config.backgroundFilter).toBeInstanceOf(MembersFilter);
    expect(background.filterJaql()).toEqual({
      and: [{ members: ['text1'] }, { members: ['1'] }],
    });
  });

  /* Losing config turns a filter the user switched OFF back ON after a reload, and guid is the
     identity filter relations match on. */
  it('keeps disabled, locked and guid through a relative-period round trip', () => {
    const filter = filterFactory.dateMeasureRelativeTo(
      lastOrder,
      dateDim.Years,
      0,
      1,
      '2013-06-01',
      {
        disabled: true,
        locked: true,
      },
    );

    const rebuilt = createFilter(filter.serialize());

    expect(rebuilt.config.disabled).toBe(true);
    expect(rebuilt.config.locked).toBe(true);
    expect(rebuilt.config.guid).toBe(filter.config.guid);
  });

  /* A stored sub-day measure carries a bucket. Left beside the filter's own level the server groups
     at a granularity nobody asked for and answers zero rows with a 200. */
  it.each([DateLevels.AggHours, DateLevels.Hours])(
    'drops the bucket a stored %s measure brings with it',
    (granularity) => {
      const stored = new DimensionalBaseMeasure(
        'Stored',
        dateDim.Years.setGranularity(granularity),
        'max',
      );

      const item = itemOf(
        filterFactory.dateMeasureMembers(stored, dateDim.Years, ['2013-01-01T00:00:00']),
      );

      expect(item.bucket).toBeUndefined();
      expect(item.level).toBe('years');
    },
  );

  it('answers a nested jaql request the way the dimension filters do', () => {
    const filter = filterFactory.dateMeasureMembers(lastOrder, dateDim.Years, [
      '2013-01-01T00:00:00',
    ]);

    expect(filter.jaql(true).level).toBe('years');
    expect(filter.jaql(true).agg).toBe('max');
  });

  /* Deserialization stays unguarded, like `aggregateWithoutDateGuards`: a dashboard saved before
     the guard existed must keep rendering. */
  it.each([
    ['a level from another dimension', 'attribute', () => shipDim.Years.serialize()],
    ['a measure that answers with a number', 'measure', () => revenue.serialize()],
  ])('rebuilds a saved filter holding %s', (_name, key, value) => {
    const saved = filterFactory
      .dateMeasureMembers(lastOrder, dateDim.Years, ['2013-01-01T00:00:00'])
      .serialize();

    expect(() => createFilter({ ...saved, [key]: value() })).not.toThrow();
  });
});

/* The existing dimension filters must serialize exactly as they did before the measure
   variants were added. */
describe('date dimension filters are untouched by the measure variants', () => {
  it('members on a dimension carries no agg and keeps its own level', () => {
    const item = filterFactory.members(dateDim.Years, ['2013-01-01T00:00:00']).jaql().jaql;

    expect(item.agg).toBeUndefined();
    expect(item.level).toBe('years');
    expect(item.filter).toStrictEqual({ members: ['2013-01-01T00:00:00'] });
  });

  it('dateRelativeTo on a dimension keeps its own toISOString anchor', () => {
    const item = filterFactory
      .dateRelativeTo(dateDim.Years, 0, 1, new Date(Date.UTC(2013, 5, 1)))
      .jaql().jaql;

    expect(item.agg).toBeUndefined();
    expect(item.filter.last.anchor).toBe('2013-06-01T00:00:00.000Z');
  });

  it('a numeric measure comparison filter is unchanged', () => {
    const item = filterFactory
      .measureGreaterThanOrEqual(measureFactory.sum(numAttr, 'Revenue'), 100)
      .jaql().jaql;

    expect(item.agg).toBe('sum');
    expect(item.filter).toStrictEqual({ from: 100 });
  });
});
