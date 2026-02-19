/* eslint-disable sonarjs/no-identical-functions */
import type {
  ChartProps as ChartPropsPreact,
  PivotTableProps as PivotTablePropsPreact,
  TableProps as TablePropsPreact,
} from '@sisense/sdk-ui-preact';

import type { ChartProps, PivotTableProps, TableProps } from '../components';

export function toChartProps(preactProps: ChartPropsPreact): ChartProps {
  const { onBeforeRender, onDataReady, ...rest } = preactProps;

  return {
    ...rest,
    beforeRender: onBeforeRender,
    dataReady: onDataReady,
  };
}

export function toTableProps(preactProps: TablePropsPreact): TableProps {
  const { onDataReady, ...rest } = preactProps;
  return {
    ...rest,
    dataReady: onDataReady,
  };
}

export function toPivotTableProps(preactProps: PivotTablePropsPreact): PivotTableProps {
  const { ...rest } = preactProps;

  return {
    ...rest,
  };
}
