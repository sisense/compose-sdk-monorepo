import { DateLevels, DimensionalLevelAttribute, measureFactory } from '@sisense/sdk-data';
import { type JaqlPanel } from '@sisense/sdk-pivot-query-client';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { type StyledMeasureColumn } from '@/domains/visualizations/core/chart-data-options/types';
import { getDefaultDateMeasureFormat } from '@/domains/visualizations/core/chart-data-options/utils';

import { resolvePivotDateMeasureFormat } from './utils';

describe('resolvePivotDateMeasureFormat', () => {
  // partial on purpose: the resolver reads only jaql
  const panelItemWithJaql = (jaql: Record<string, unknown>) => ({ jaql } as JaqlPanel);
  const levelAttribute = (granularity: string, format?: string) =>
    new DimensionalLevelAttribute(granularity, '[Commerce.Date (Calendar)]', granularity, format);

  it('prefers the dateFormat already on the data option', () => {
    const dataOption = {
      column: measureFactory.max(levelAttribute(DateLevels.Days), 'Max Date'),
      dateFormat: 'MM/yyyy',
    } as StyledMeasureColumn;

    expect(resolvePivotDateMeasureFormat(dataOption, panelItemWithJaql({ level: 'days' }))).toBe(
      'MM/yyyy',
    );
  });

  it('falls back to the format carried by the measure attribute', () => {
    const dataOption = {
      column: measureFactory.max(levelAttribute(DateLevels.Days, 'dd.MM.yyyy'), 'Max Date'),
    } as StyledMeasureColumn;

    expect(resolvePivotDateMeasureFormat(dataOption, panelItemWithJaql({ level: 'days' }))).toBe(
      'dd.MM.yyyy',
    );
  });

  it.each([
    [{ level: 'days' }, 'yyyy-MM-dd'],
    [{ level: 'months' }, 'yyyy-MM'],
    [{ level: 'years' }, 'yyyy'],
    [{ level: 'quarters' }, 'Q yyyy'],
  ])('falls back to the level default from the panel item for %o', (jaql, expected) => {
    // no data option at all, the shape a formula date measure arrives in
    expect(resolvePivotDateMeasureFormat(undefined, panelItemWithJaql(jaql))).toBe(expected);
  });

  it('falls back to the days mask when there is no panel item at all', () => {
    expect(resolvePivotDateMeasureFormat(undefined, undefined)).toBe('yyyy-MM-dd');
  });

  it('falls back to the days mask when the level default is empty', () => {
    // a granularity the default table does not answer for, so the last fallback is what shows
    expect(
      resolvePivotDateMeasureFormat(undefined, panelItemWithJaql({ level: 'fortnights' })),
    ).toBe('yyyy-MM-dd');
  });

  it('clamps a sub-day measure to the days mask rather than its own HH:mm', () => {
    // dateFormat is '' so the option-level check is skipped and getDefaultDateMeasureFormat
    // decides; it clamps every sub-day level to the days mask
    const dataOption = {
      column: measureFactory.max(DM.Commerce.Date.AggHours, 'Max Agg Hours'),
      dateFormat: '',
    } as StyledMeasureColumn;

    expect(resolvePivotDateMeasureFormat(dataOption, panelItemWithJaql({ level: 'minutes' }))).toBe(
      'yyyy-MM-dd',
    );
  });

  it('matches getDefaultDateMeasureFormat for a sub-day measure', () => {
    const column = measureFactory.max(DM.Commerce.Date.AggHours, 'Max Agg Hours');
    const dataOption = { column, dateFormat: '' } as StyledMeasureColumn;

    expect(resolvePivotDateMeasureFormat(dataOption, panelItemWithJaql({ level: 'minutes' }))).toBe(
      getDefaultDateMeasureFormat(column),
    );
  });

  it('uses DimensionalLevelAttribute.getDefaultFormatForGranularity like the dimension path', () => {
    const viaDimension = DimensionalLevelAttribute.getDefaultFormatForGranularity(
      DateLevels.Months,
    );

    expect(resolvePivotDateMeasureFormat(undefined, panelItemWithJaql({ level: 'months' }))).toBe(
      viaDimension,
    );
  });
});
