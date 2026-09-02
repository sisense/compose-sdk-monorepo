import { DataSource } from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep';
import { describe, expect, it } from 'vitest';

import { WidgetProps } from '@/domains/widgets/components/widget/types';

import { DashboardConfig, WidgetsPanelColumnLayout } from './types.js';
import {
  checkForAutoHeight,
  isDashboardHeaderVisible,
  withOptionallyDisabledAutoHeight,
  withResolvedWidgetDataSource,
  withWidgetAppendedToPanelLayout,
} from './utils.js';

const chartWidget = (dataSource?: DataSource): WidgetProps => ({
  id: 'chart-1',
  widgetType: 'chart',
  chartType: 'bar',
  dataOptions: { category: [], value: [], breakBy: [] },
  ...(dataSource ? { dataSource } : {}),
});

const getDataSource = (widget: WidgetProps): DataSource | undefined =>
  (widget as { dataSource?: DataSource }).dataSource;

const layoutWith = (...widgetIds: string[]): WidgetsPanelColumnLayout => ({
  columns: [
    {
      widthPercentage: 100,
      rows: widgetIds.map((widgetId) => ({ cells: [{ widthPercentage: 100, widgetId }] })),
    },
  ],
});

const widgetIdsOf = (layout: WidgetsPanelColumnLayout): string[] =>
  layout.columns.flatMap((column) =>
    column.rows.flatMap((row) => row.cells.map((cell) => cell.widgetId)),
  );

describe('withResolvedWidgetDataSource', () => {
  it('keeps the widget own data source when present', () => {
    const widget = chartWidget('own-source');
    const result = withResolvedWidgetDataSource(['dashboard-source', 'app-source'])(widget);
    // Unchanged reference: nothing to resolve.
    expect(result).toBe(widget);
    expect(getDataSource(result)).toBe('own-source');
  });

  it('falls back to the first defined fallback data source', () => {
    const widget = chartWidget();
    const result = withResolvedWidgetDataSource([undefined, 'app-source'])(widget);
    expect(getDataSource(result)).toBe('app-source');
  });

  it('prefers an earlier fallback over a later one', () => {
    const widget = chartWidget();
    const result = withResolvedWidgetDataSource(['dashboard-source', 'app-source'])(widget);
    expect(getDataSource(result)).toBe('dashboard-source');
  });

  it('returns the widget unchanged when no data source is available', () => {
    const widget = chartWidget();
    const result = withResolvedWidgetDataSource([undefined, undefined])(widget);
    expect(result).toBe(widget);
    expect(getDataSource(result)).toBeUndefined();
  });

  it('leaves text widgets (which have no data source) unchanged', () => {
    const textWidget: WidgetProps = {
      id: 'text-1',
      widgetType: 'text',
      styleOptions: { html: '<div>hi</div>', vAlign: 'valign-middle', bgColor: '#fff' },
    };
    const result = withResolvedWidgetDataSource(['dashboard-source'])(textWidget);
    expect(result).toBe(textWidget);
    expect('dataSource' in result).toBe(false);
  });
});

describe('withWidgetAppendedToPanelLayout', () => {
  it('appends a new full-width row to the end of the first column', () => {
    const result = withWidgetAppendedToPanelLayout('w2')(layoutWith('w1'));
    expect(widgetIdsOf(result)).toEqual(['w1', 'w2']);
  });

  it('creates a column when the layout has none', () => {
    const result = withWidgetAppendedToPanelLayout('w1')({ columns: [] });
    expect(widgetIdsOf(result)).toEqual(['w1']);
  });
});

describe('isDashboardHeaderVisible', () => {
  it('defaults to visible when no config is provided', () => {
    expect(isDashboardHeaderVisible()).toBe(true);
    expect(isDashboardHeaderVisible({})).toBe(true);
  });

  it('respects `header.visible`', () => {
    expect(isDashboardHeaderVisible({ header: { visible: true } })).toBe(true);
    expect(isDashboardHeaderVisible({ header: { visible: false } })).toBe(false);
  });

  it('falls back to the deprecated `toolbar.visible` when `header.visible` is not set', () => {
    expect(isDashboardHeaderVisible({ toolbar: { visible: true } })).toBe(true);
    expect(isDashboardHeaderVisible({ toolbar: { visible: false } })).toBe(false);
    // `header` present but without `visible` should still fall back to `toolbar.visible`.
    expect(isDashboardHeaderVisible({ header: {}, toolbar: { visible: false } })).toBe(false);
  });

  it('gives `header.visible` precedence over the deprecated `toolbar.visible`', () => {
    expect(
      isDashboardHeaderVisible({ header: { visible: false }, toolbar: { visible: true } }),
    ).toBe(false);
    expect(
      isDashboardHeaderVisible({ header: { visible: true }, toolbar: { visible: false } }),
    ).toBe(true);
  });

  it('ignores unrelated config and defaults to visible when neither flag is set', () => {
    // A config object where neither `header.visible` nor `toolbar.visible` is set resolves to
    // visible, regardless of unrelated fields such as `filtersPanel.visible`.
    const config: DashboardConfig = { filtersPanel: { visible: false } };
    expect(isDashboardHeaderVisible(config)).toBe(true);
  });
});

const tableWidget = (isAutoHeight?: boolean): WidgetProps => ({
  id: 'table-1',
  widgetType: 'chart',
  chartType: 'table',
  dataOptions: { columns: [] },
  ...(isAutoHeight === undefined ? {} : { styleOptions: { isAutoHeight } }),
});

const pivotWidget = (isAutoHeight?: boolean): WidgetProps => ({
  id: 'pivot-1',
  widgetType: 'pivot',
  dataOptions: {},
  ...(isAutoHeight === undefined ? {} : { styleOptions: { isAutoHeight } }),
});

// A table widget carrying sibling style options, so transformations can be asserted whole rather
// than only on `isAutoHeight`. `ChartWidgetProps` is not discriminated by `chartType`, so the
// table-only style option is not assignable through the union in a literal; hence the cast.
const tableWidgetWithStyle = (isAutoHeight: boolean): WidgetProps =>
  ({
    id: 'table-1',
    widgetType: 'chart',
    chartType: 'table',
    dataOptions: { columns: [] },
    styleOptions: {
      isAutoHeight,
      rowsPerPage: 25,
      header: { color: { enabled: true } },
    },
  } as unknown as WidgetProps);

const isAutoHeightOf = (widget: WidgetProps): boolean | undefined =>
  (widget as { styleOptions?: { isAutoHeight?: boolean } }).styleOptions?.isAutoHeight;

describe('checkForAutoHeight', () => {
  it('accepts a table chart with auto height enabled', () => {
    expect(checkForAutoHeight([tableWidget(true)])).toBe(true);
  });

  it('accepts a row mixing pivot and table when both opt in', () => {
    expect(checkForAutoHeight([pivotWidget(true), tableWidget(true)])).toBe(true);
  });

  it('rejects a table chart that has not opted in', () => {
    expect(checkForAutoHeight([tableWidget(false)])).toBe(false);
    expect(checkForAutoHeight([tableWidget()])).toBe(false);
  });

  it('rejects a row where any widget does not support auto height', () => {
    expect(checkForAutoHeight([tableWidget(true), chartWidget()])).toBe(false);
  });

  it('rejects non-table chart types even when styleOptions say otherwise', () => {
    const barWithFlag = {
      ...chartWidget(),
      styleOptions: { isAutoHeight: true },
    } as unknown as WidgetProps;

    expect(checkForAutoHeight([barWithFlag])).toBe(false);
  });
});

describe('withOptionallyDisabledAutoHeight', () => {
  it('disables auto height on a table chart and preserves every other field', () => {
    expect(withOptionallyDisabledAutoHeight(tableWidgetWithStyle(true), true)).toEqual(
      tableWidgetWithStyle(false),
    );
  });

  it('does not mutate the widget it was given', () => {
    const widget = tableWidgetWithStyle(true);
    const before = cloneDeep(widget);

    withOptionallyDisabledAutoHeight(widget, true);

    expect(widget).toEqual(before);
  });

  it('disables auto height on a pivot when asked', () => {
    expect(isAutoHeightOf(withOptionallyDisabledAutoHeight(pivotWidget(true), true))).toBe(false);
  });

  it('leaves the widget untouched when not asked to disable', () => {
    const widget = tableWidget(true);
    expect(withOptionallyDisabledAutoHeight(widget, false)).toBe(widget);
  });

  it('leaves an unsupported widget type untouched', () => {
    const widget = chartWidget();
    expect(withOptionallyDisabledAutoHeight(widget, true)).toBe(widget);
  });
});
