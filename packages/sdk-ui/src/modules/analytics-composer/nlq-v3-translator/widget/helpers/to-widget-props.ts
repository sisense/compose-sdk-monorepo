import { isDataSource } from '@sisense/sdk-data';

import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';
import type { ChartProps, PivotTableProps } from '@/props.js';

import type { DataSourceJSON, WidgetConfigJSON } from '../../types.js';

export type WidgetMeta = {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly dataSource?: DataSourceJSON;
  readonly config?: WidgetConfigJSON;
  readonly highlightSelectionDisabled?: boolean;
};

/**
 * Maps chart component props (with `dataSet`) to chart widget props (with `dataSource`).
 *
 * @internal
 */
export const toChartWidgetProps = (
  chartProps: ChartProps,
  meta: WidgetMeta,
): Extract<WidgetProps, { widgetType: 'chart' }> => {
  const { dataSet, ...chartFields } = chartProps;
  return {
    ...chartFields,
    widgetType: 'chart',
    id: meta.id,
    ...(meta.dataSource !== undefined
      ? { dataSource: meta.dataSource }
      : dataSet !== undefined && isDataSource(dataSet) && { dataSource: dataSet }),
    ...(meta.config !== undefined && { config: meta.config }),
    ...(meta.highlightSelectionDisabled !== undefined && {
      highlightSelectionDisabled: meta.highlightSelectionDisabled,
    }),
    ...(meta.title !== undefined && { title: meta.title }),
    ...(meta.description !== undefined && { description: meta.description }),
  };
};

/**
 * Maps pivot table component props (with `dataSet`) to pivot widget props (with `dataSource`).
 *
 * @internal
 */
export const toPivotTableWidgetProps = (
  pivotProps: PivotTableProps,
  meta: WidgetMeta,
): Extract<WidgetProps, { widgetType: 'pivot' }> => {
  const { dataSet, ...pivotFields } = pivotProps;
  return {
    ...pivotFields,
    widgetType: 'pivot',
    id: meta.id,
    ...(meta.dataSource !== undefined
      ? { dataSource: meta.dataSource }
      : dataSet !== undefined && isDataSource(dataSet) && { dataSource: dataSet }),
    ...(meta.config !== undefined && { config: meta.config }),
    ...(meta.title !== undefined && { title: meta.title }),
    ...(meta.description !== undefined && { description: meta.description }),
  };
};
