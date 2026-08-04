import React from 'react';

import { Data } from '@sisense/sdk-data';
import type { StoryFn } from '@storybook/react';

import { Chart } from '../domains/visualizations/components/chart';
import { KpiChart } from '../domains/visualizations/components/kpi-chart';
import { KpiChartDataOptions, KpiStyleOptions } from '../types';
import { templateForComponent } from './template';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Kpi',
  component: KpiChart,
};

const kpiData: Data = {
  columns: [
    { name: 'Months', type: 'datetime' },
    { name: 'Total Revenue', type: 'number' },
    { name: 'Total Cost', type: 'number' },
  ],
  rows: [
    ['2026-01-01T00:00:00', 5400, 5100],
    ['2026-02-01T00:00:00', 6100, 5600],
    ['2026-03-01T00:00:00', 5800, 5900],
    ['2026-04-01T00:00:00', 6900, 6000],
    ['2026-05-01T00:00:00', 7400, 6800],
    ['2026-06-01T00:00:00', 7100, 7300],
  ],
};

const revenue = { name: 'Total Revenue', aggregation: 'sum' };
const cost = { name: 'Total Cost', aggregation: 'sum' };
const months = { name: 'Months', type: 'datetime' };

const withCardSize = (Story: StoryFn) => {
  const StoryComponent = Story as unknown as React.ComponentType;
  return (
    <div style={{ width: 280, height: 200 }}>
      <StoryComponent />
    </div>
  );
};

const valueOnlyDataOptions: KpiChartDataOptions = { value: revenue };

export const valueOnly = template(
  { chartType: 'kpi', dataSet: kpiData, dataOptions: valueOnlyDataOptions },
  [withCardSize],
);

export const previousPeriodWithSparkline = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: revenue,
      category: months,
      comparison: { type: 'previous-period' },
    } satisfies KpiChartDataOptions,
  },
  [withCardSize],
);

export const targetComparison = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: revenue,
      category: months,
      comparison: { type: 'target', target: cost },
    } satisfies KpiChartDataOptions,
  },
  [withCardSize],
);

export const fixedNumberTarget = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: revenue,
      // Fixed-number target: the goal is a constant, not a queried measure.
      comparison: { type: 'target', target: 6500 },
    } satisfies KpiChartDataOptions,
  },
  [withCardSize],
);

export const customTargetTexts = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: revenue,
      comparison: { type: 'target', target: cost },
    } satisfies KpiChartDataOptions,
    styleOptions: {
      comparison: {
        display: 'both',
        // Per-instance templates replacing the localized 'of goal' / 'to go' strings.
        ofGoalText: '{{percent}} of {{goal}} target',
        toGoText: '{{value}} remaining',
      },
    } satisfies KpiStyleOptions,
  },
  [withCardSize],
);

export const deltaComparison = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: revenue,
      comparison: { type: 'delta', value: cost },
    } satisfies KpiChartDataOptions,
  },
  [withCardSize],
);

export const plainValueComparison = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: revenue,
      comparison: { type: 'value', value: cost },
    } satisfies KpiChartDataOptions,
  },
  [withCardSize],
);

export const comparisonFirstLayout = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: revenue,
      comparison: { type: 'target', target: cost },
    } satisfies KpiChartDataOptions,
    styleOptions: { layout: 'comparison-first' } satisfies KpiStyleOptions,
  },
  [withCardSize],
);

export const lowIsGoodInverted = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: cost,
      category: months,
      comparison: { type: 'previous-period' },
    } satisfies KpiChartDataOptions,
    styleOptions: {
      // Down is good for a cost measure: negative change → green, positive → red.
      comparison: {
        color: {
          type: 'conditional',
          conditions: [
            { color: '#2ea44f', expression: '0', operator: '<' },
            { color: '#cf222e', expression: '0', operator: '>' },
          ],
        },
      },
    } satisfies KpiStyleOptions,
  },
  [withCardSize],
);

export const coloredTile = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: { value: revenue, category: months } satisfies KpiChartDataOptions,
    styleOptions: {
      sparkline: { chartType: 'line' },
      card: { backgroundColor: '#2ecc71', cornerRadius: 12 },
    } satisfies KpiStyleOptions,
  },
  [withCardSize],
);

const largeValueData: Data = {
  columns: kpiData.columns,
  rows: [
    ['2026-01-01T00:00:00', 140380000, 121000000],
    ['2026-02-01T00:00:00', 155200000, 131500000],
    ['2026-03-01T00:00:00', 170438765, 149900000],
  ],
};

/** Reproduces the auto-fit stress case: a wide formatted value in a fixed card */
export const autoFitLargeNumber = template(
  {
    chartType: 'kpi',
    dataSet: largeValueData,
    dataOptions: { value: revenue, category: months } satisfies KpiChartDataOptions,
  },
  [
    (Story: StoryFn) => {
      const StoryComponent = Story as unknown as React.ComponentType;
      return (
        <div style={{ width: 320, height: 220 }}>
          <StoryComponent />
        </div>
      );
    },
  ],
);

export const customTypography = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      // Value color rides the standard measure-color mechanism (uniform here).
      value: { column: revenue, color: { type: 'uniform', color: '#7b68ee' } },
      category: months,
    } satisfies KpiChartDataOptions,
    styleOptions: {
      value: { textSize: 48 },
      title: { text: 'Monthly Revenue' },
      card: { textAlign: 'center', showBorder: true },
    } satisfies KpiStyleOptions,
  },
  [withCardSize],
);

/** Conditional icons: a built-in named SVG on the value, a custom svg-path on the comparison. */
export const conditionalIcons = template(
  {
    chartType: 'kpi',
    dataSet: kpiData,
    dataOptions: {
      value: revenue,
      category: months,
      comparison: { type: 'previous-period' },
    } satisfies KpiChartDataOptions,
    styleOptions: {
      value: {
        conditionalIcons: [
          {
            icon: { type: 'built-in', name: 'check', color: '#2ea44f' },
            expression: '6000',
            operator: '>',
          },
          {
            icon: { type: 'built-in', name: 'warning', color: '#cf222e' },
            expression: '6000',
            operator: '<=',
          },
        ],
      },
      comparison: {
        conditionalIcons: [
          {
            // Any icon as inert path geometry (Material 'bolt' path data, 24-grid).
            icon: {
              type: 'svg-path',
              d: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66s.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21',
            },
            // The sample data's June-vs-May delta is negative, so gate on '<' to keep the
            // svg-path icon visible in the story.
            expression: '0',
            operator: '<',
          },
        ],
      },
    } satisfies KpiStyleOptions,
  },
  [withCardSize],
);
