/** @vitest-environment jsdom */
import type {
  ChartProps as ChartPropsPreact,
  PivotTableProps as PivotTablePropsPreact,
  TableProps as TablePropsPreact,
} from '@sisense/sdk-ui-preact';
import { describe, expect, it, vi } from 'vitest';

import { toChartProps, toPivotTableProps, toTableProps } from './chart-props-preact-translator';

describe('chart-props-preact-translator', () => {
  describe('toChartProps', () => {
    it('should convert preact ChartProps to Angular ChartProps', () => {
      const preactProps: ChartPropsPreact = {
        chartType: 'column',
        dataSet: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        onBeforeRender: vi.fn(),
        onDataReady: vi.fn(),
        styleOptions: { width: 800, height: 500 },
      };

      const result = toChartProps(preactProps);

      expect(result).toEqual({
        chartType: 'column',
        dataSet: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        beforeRender: preactProps.onBeforeRender,
        dataReady: preactProps.onDataReady,
        styleOptions: { width: 800, height: 500 },
      });
      expect(result.beforeRender).toBe(preactProps.onBeforeRender);
      expect(result.dataReady).toBe(preactProps.onDataReady);
    });

    it('should handle props without event handlers', () => {
      const preactProps: ChartPropsPreact = {
        chartType: 'bar',
        dataSet: 'Sample Healthcare',
        dataOptions: {
          category: [],
          value: [],
        },
      };

      const result = toChartProps(preactProps);

      expect(result).toEqual({
        chartType: 'bar',
        dataSet: 'Sample Healthcare',
        dataOptions: {
          category: [],
          value: [],
        },
        beforeRender: undefined,
        dataReady: undefined,
      });
    });

    it('should preserve all other props', () => {
      const preactProps: ChartPropsPreact = {
        chartType: 'line',
        dataSet: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        filters: [],
        highlights: [],
        styleOptions: { width: 1000 },
        onBeforeRender: vi.fn(),
        onDataReady: vi.fn(),
      };

      const result = toChartProps(preactProps);

      expect(result.filters).toEqual([]);
      expect(result.highlights).toEqual([]);
      expect(result.styleOptions).toEqual({ width: 1000 });
    });
  });

  describe('toTableProps', () => {
    it('should convert preact TableProps to Angular TableProps', () => {
      const preactProps: TablePropsPreact = {
        dataSet: 'Sample ECommerce',
        dataOptions: {
          columns: [],
        },
        onDataReady: vi.fn(),
        styleOptions: { width: 800 },
      };

      const result = toTableProps(preactProps);

      expect(result).toEqual({
        dataSet: 'Sample ECommerce',
        dataOptions: {
          columns: [],
        },
        dataReady: preactProps.onDataReady,
        styleOptions: { width: 800 },
      });
      expect(result.dataReady).toBe(preactProps.onDataReady);
    });

    it('should handle props without onDataReady handler', () => {
      const preactProps: TablePropsPreact = {
        dataSet: 'Sample Healthcare',
        dataOptions: {
          columns: [],
        },
      };

      const result = toTableProps(preactProps);

      expect(result).toEqual({
        dataSet: 'Sample Healthcare',
        dataOptions: {
          columns: [],
        },
        dataReady: undefined,
      });
    });

    it('should preserve all other props', () => {
      const preactProps: TablePropsPreact = {
        dataSet: 'Sample ECommerce',
        dataOptions: {
          columns: [],
        },
        filters: [],
        styleOptions: { width: 1000, height: 600 },
        onDataReady: vi.fn(),
      };

      const result = toTableProps(preactProps);

      expect(result.filters).toEqual([]);
      expect(result.styleOptions).toEqual({ width: 1000, height: 600 });
    });
  });

  describe('toPivotTableProps', () => {
    it('should convert preact PivotTableProps to Angular PivotTableProps', () => {
      const preactProps: PivotTablePropsPreact = {
        dataSet: 'Sample ECommerce',
        dataOptions: {
          rows: [],
          columns: [],
          values: [],
        },
        styleOptions: { width: 800, height: 500 },
      };

      const result = toPivotTableProps(preactProps);

      expect(result).toEqual({
        dataSet: 'Sample ECommerce',
        dataOptions: {
          rows: [],
          columns: [],
          values: [],
        },
        styleOptions: { width: 800, height: 500 },
      });
    });

    it('should preserve all props without transformation', () => {
      const preactProps: PivotTablePropsPreact = {
        dataSet: 'Sample Healthcare',
        dataOptions: {
          rows: [],
          columns: [],
          values: [],
        },
        filters: [],
        styleOptions: { width: 1000 },
      };

      const result = toPivotTableProps(preactProps);

      expect(result).toEqual(preactProps);
    });

    it('should handle empty props object', () => {
      const preactProps: PivotTablePropsPreact = {} as PivotTablePropsPreact;

      const result = toPivotTableProps(preactProps);

      expect(result).toEqual({});
    });
  });
});
