/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  CartesianChartDataOptionsInternal,
  StyledMeasureColumn,
  StyledColumn,
} from '../chart-data-options/types';

export const onlyY = ({ x, y, breakBy }: CartesianChartDataOptionsInternal): boolean =>
  hasYColumns(y) && noXColumns(x) && breakBy.length === 0;

export const onlyYAndSeries = ({ x, y, breakBy }: CartesianChartDataOptionsInternal): boolean =>
  noXColumns(x) && hasYColumns(y) && breakBy.length > 0;

const noXColumns = (x: StyledColumn[]) => x.length === 0;

const hasYColumns = (y: StyledMeasureColumn[]) => y.length > 0;

export const isEnabled = (enabled?: boolean) => enabled === undefined || enabled === true;

export const fraction = (base: number, percentage: number): number => base * (percentage / 100);
export const fromFraction = (base: number, value: number): number =>
  base === 0 ? 0 : (Math.abs(value) / Math.abs(base)) * 100;

export const withPercentSign = (x: number | string): string => `${x}%`;
