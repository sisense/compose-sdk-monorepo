import { createAttribute } from '../attributes.js';
import { createDateDimension } from '../dimensions/index.js';
import { Filter } from '../interfaces.js';
import * as measureFactory from '../measures/factory.js';
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
    expect(f).toHaveProperty('valueA', '2020-02-02T00:00:00Z');
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
    expect(f).toHaveProperty('valueB', '2020-02-02T00:00:00Z');

    const f2 = filterFactory.dateTo(dateDim.Years, '2020-02-02T00:00:00Z', config);
    testConfig(
      f2,
      `filterFactory.dateTo(DM.Table.Date.Years, '2020-02-02T00:00:00Z', { disabled: true, locked: true })`,
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
    expect(f).toHaveProperty('valueA', '2020-02-02T00:00:00Z');
    expect(f).toHaveProperty('operatorB', DateOperators.To);
    expect(f).toHaveProperty('valueB', '2021-02-02T00:00:00Z');

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
