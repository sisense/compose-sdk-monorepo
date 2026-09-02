/** @vitest-environment jsdom */
import { isValidElement } from 'react';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type {
  WidgetHeaderConfig,
  WidgetHeaderItem,
} from '@/domains/widgets/shared/widget-header/widget-header-config';

import { CHART_TABLE_TOGGLE_ITEM_ID } from './chart-table-toggle-header-item';
import { useChartTableToggle } from './use-chart-table-toggle';
import {
  type ChartTableToggleWidget,
  useWidgetsChartTableToggle,
} from './use-widgets-chart-table-toggle';

const barDataOptions = {
  category: [{ column: { name: 'Category' } }],
  value: [{ column: { name: 'Revenue' } }],
};

const tableDataOptions = {
  columns: [{ column: { name: 'Category' } }, { column: { name: 'Revenue' } }],
};

const chartWidget: ChartTableToggleWidget = {
  id: 'w-1',
  widgetType: 'chart',
  chartType: 'bar',
  dataOptions: barDataOptions,
};

type ToggleButtonProps = {
  pressed: boolean;
  disabled?: boolean;
  disabledTitle?: string;
  onPressedChange: (pressed: boolean) => void;
};

/** The toggle's header item, or `undefined` when the widget got none. */
function getToggleItem(widget: ChartTableToggleWidget | undefined): WidgetHeaderItem | undefined {
  const config = widget?.config as { header?: WidgetHeaderConfig } | undefined;
  return config?.header?.items?.find((item) => item.id === CHART_TABLE_TOGGLE_ITEM_ID);
}

/** Renders the item's component to read the button's props, without mounting it. */
function getToggleButtonProps(widget: ChartTableToggleWidget | undefined): ToggleButtonProps {
  const button = getToggleItem(widget)?.component({ size: { width: 24, height: 24 } });
  if (!isValidElement(button)) {
    throw new Error('expected chart-table toggle button');
  }
  return button.props as ToggleButtonProps;
}

describe('useChartTableToggle', () => {
  it('clears table view on the same render when resetKey changes', () => {
    const { result, rerender } = renderHook(
      ({ resetKey }: { resetKey: string }) =>
        useChartTableToggle('bar', { dataOptions: barDataOptions, resetKey }),
      { initialProps: { resetKey: 'tool-1' } },
    );

    act(() => {
      result.current.setIsTableView(true);
    });
    expect(result.current.isTableView).toBe(true);

    rerender({ resetKey: 'tool-2' });
    expect(result.current.isTableView).toBe(false);
    expect(
      result.current.applyOverride({ chartType: 'bar', dataOptions: barDataOptions }).chartType,
    ).toBe('bar');
  });

  it('treats NaN resetKey as a stable identity', () => {
    const { result, rerender } = renderHook(
      ({ resetKey }: { resetKey: number }) =>
        useChartTableToggle('bar', { dataOptions: barDataOptions, resetKey }),
      { initialProps: { resetKey: Number.NaN } },
    );

    act(() => {
      result.current.setIsTableView(true);
    });
    rerender({ resetKey: Number.NaN });
    expect(result.current.isTableView).toBe(true);
  });

  it('does not reset or loop when resetKey is a new object each render', () => {
    const { result, rerender } = renderHook(
      ({ resetKey }: { resetKey: object }) =>
        useChartTableToggle('bar', {
          dataOptions: barDataOptions,
          // @ts-expect-error object keys are ignored at runtime so an inline {} cannot loop
          resetKey,
        }),
      { initialProps: { resetKey: { n: 1 } } },
    );

    act(() => {
      result.current.setIsTableView(true);
    });
    rerender({ resetKey: { n: 1 } });
    expect(result.current.isTableView).toBe(true);
  });

  it('keeps the toggle visible but disabled when trend or forecast is set', () => {
    const { result } = renderHook(() =>
      useChartTableToggle('line', {
        dataOptions: {
          category: barDataOptions.category,
          value: [{ column: { name: 'Revenue' }, forecast: { forecastHorizon: 3 } }],
        },
      }),
    );

    expect(result.current.showToggle).toBe(true);
    act(() => {
      result.current.setIsTableView(true);
    });
    expect(result.current.isTableView).toBe(false);
    expect(
      result.current.applyOverride({
        chartType: 'line',
        dataOptions: barDataOptions,
      }).chartType,
    ).toBe('line');
  });
});

describe('useWidgetsChartTableToggle', () => {
  it('keeps table view on a titled widget after reorder', () => {
    const revenue: ChartTableToggleWidget = {
      widgetType: 'chart',
      title: 'Revenue',
      chartType: 'bar',
      dataOptions: barDataOptions,
    };
    const cost: ChartTableToggleWidget = {
      widgetType: 'chart',
      title: 'Cost',
      chartType: 'bar',
      dataOptions: {
        category: [{ column: { name: 'Category' } }],
        value: [{ column: { name: 'Cost' } }],
      },
    };
    const { result, rerender } = renderHook(
      ({ widgets }: { widgets: ChartTableToggleWidget[] }) => useWidgetsChartTableToggle(widgets),
      { initialProps: { widgets: [revenue, cost] } },
    );

    act(() => {
      getToggleButtonProps(result.current[0]).onPressedChange(true);
    });
    expect(result.current[0]?.chartType).toBe('table');

    rerender({ widgets: [cost, revenue] });
    expect(result.current[0]?.title).toBe('Cost');
    expect(result.current[0]?.chartType).toBe('bar');
    expect(result.current[1]?.title).toBe('Revenue');
    expect(result.current[1]?.chartType).toBe('table');
  });

  it('keeps table view on an untitled widget after reorder via query identity', () => {
    const revenue: ChartTableToggleWidget = {
      widgetType: 'chart',
      chartType: 'bar',
      dataOptions: barDataOptions,
    };
    const cost: ChartTableToggleWidget = {
      widgetType: 'chart',
      chartType: 'bar',
      dataOptions: {
        category: [{ column: { name: 'Category' } }],
        value: [{ column: { name: 'Cost' } }],
      },
    };
    const { result, rerender } = renderHook(
      ({ widgets }: { widgets: ChartTableToggleWidget[] }) => useWidgetsChartTableToggle(widgets),
      { initialProps: { widgets: [revenue, cost] } },
    );

    act(() => {
      getToggleButtonProps(result.current[0]).onPressedChange(true);
    });
    rerender({ widgets: [cost, revenue] });
    expect(result.current[0]?.dataOptions).toEqual(cost.dataOptions);
    expect(result.current[0]?.chartType).toBe('bar');
    expect(result.current[1]?.chartType).toBe('table');
  });

  it('wires the toggle on unsaved widgets without an id', () => {
    const widgets: ChartTableToggleWidget[] = [
      { widgetType: 'chart', chartType: 'bar', dataOptions: barDataOptions },
    ];
    const { result } = renderHook(() => useWidgetsChartTableToggle(widgets));

    expect(getToggleItem(result.current[0])).toBeDefined();
    act(() => {
      getToggleButtonProps(result.current[0]).onPressedChange(true);
    });
    expect(result.current[0]?.chartType).toBe('table');
    expect(result.current[0]?.dataOptions).toEqual(tableDataOptions);
  });

  it('overrides chartType and dataOptions when table view is toggled', () => {
    const { result } = renderHook(() => useWidgetsChartTableToggle([chartWidget]));

    expect(result.current[0]?.chartType).toBe('bar');
    expect(result.current[0]?.dataOptions).toEqual(barDataOptions);

    act(() => {
      getToggleButtonProps(result.current[0]).onPressedChange(true);
    });
    expect(result.current[0]?.chartType).toBe('table');
    expect(result.current[0]?.dataOptions).toEqual(tableDataOptions);

    act(() => {
      getToggleButtonProps(result.current[0]).onPressedChange(false);
    });
    expect(result.current[0]?.chartType).toBe('bar');
    expect(result.current[0]?.dataOptions).toEqual(barDataOptions);
  });

  it('clears table view when the same widget id changes chart type', () => {
    const { result, rerender } = renderHook(
      ({ chartType }: { chartType: string }) =>
        useWidgetsChartTableToggle([{ ...chartWidget, chartType }]),
      { initialProps: { chartType: 'bar' } },
    );

    act(() => {
      getToggleButtonProps(result.current[0]).onPressedChange(true);
    });
    expect(result.current[0]?.chartType).toBe('table');

    rerender({ chartType: 'line' });
    expect(result.current[0]?.chartType).toBe('line');
  });

  it('treats NaN resetKey as a stable identity', () => {
    const { result, rerender } = renderHook(
      ({ resetKey }: { resetKey: number }) =>
        useWidgetsChartTableToggle([chartWidget], { resetKey }),
      { initialProps: { resetKey: Number.NaN } },
    );

    act(() => {
      getToggleButtonProps(result.current[0]).onPressedChange(true);
    });
    rerender({ resetKey: Number.NaN });
    expect(result.current[0]?.chartType).toBe('table');
  });

  it('does not reset or loop when resetKey is a new object each render', () => {
    const { result, rerender } = renderHook(
      ({ resetKey }: { resetKey: object }) =>
        // @ts-expect-error object keys are ignored at runtime so an inline {} cannot loop
        useWidgetsChartTableToggle([chartWidget], { resetKey }),
      { initialProps: { resetKey: { n: 1 } } },
    );

    act(() => {
      getToggleButtonProps(result.current[0]).onPressedChange(true);
    });
    rerender({ resetKey: { n: 1 } });
    expect(result.current[0]?.chartType).toBe('table');
  });

  it('disables the toggle when a widget has trend or forecast', () => {
    const widgets: ChartTableToggleWidget[] = [
      {
        ...chartWidget,
        chartType: 'line',
        dataOptions: {
          category: barDataOptions.category,
          value: [{ column: { name: 'Revenue' }, trend: { modelType: 'linear' } }],
        },
      },
    ];
    const { result } = renderHook(() => useWidgetsChartTableToggle(widgets));
    const toggle = getToggleButtonProps(result.current[0]);

    expect(result.current[0]?.chartType).toBe('line');
    expect(toggle.disabled).toBe(true);
    expect(toggle.disabledTitle).toMatch(/trend or forecast/i);

    act(() => {
      toggle.onPressedChange(true);
    });
    expect(result.current[0]?.chartType).toBe('line');
  });
});
