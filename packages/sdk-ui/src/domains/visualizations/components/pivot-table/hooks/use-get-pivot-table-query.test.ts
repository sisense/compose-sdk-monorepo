import {
  createDateDimension,
  DateLevels,
  DimensionalLevelAttribute,
  EMPTY_PIVOT_QUERY_RESULT_DATA,
  measureFactory,
} from '@sisense/sdk-data';
import { type JaqlQueryPayload, type QueryExecutionConfig } from '@sisense/sdk-query-client';
import { renderHook, waitFor } from '@testing-library/react';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { executePivotQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import { translatePivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options';
import { type ClientApplication } from '@/infra/app/types';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';

import { mockPivotTableProps } from '../__mocks__/mocks';
import { getPivotQueryOptions, usePivotTableQuery } from './use-get-pivot-table-query';

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

const usePivotTableQueryPropsMock = {
  dataSet: mockPivotTableProps.dataSet,
  dataOptionsInternal: translatePivotTableDataOptions(mockPivotTableProps.dataOptions),
  filters: mockPivotTableProps.filters,
};

describe('usePivotTableQuery', () => {
  beforeEach(() => {
    executePivotQueryMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: { settings: { trackingConfig: { enabled: false } } } as ClientApplication,
      isInitialized: true,
    });
  });

  it('should run the hook', async () => {
    const jaqlMock = { someProp: 'some pivot query prop value' } as unknown as JaqlQueryPayload;

    executePivotQueryMock.mockImplementation(async (...args: any) => {
      const onBeforeQuery: QueryExecutionConfig['onBeforeQuery'] = args[2]?.onBeforeQuery;
      if (onBeforeQuery) {
        onBeforeQuery(jaqlMock);
      }
      return EMPTY_PIVOT_QUERY_RESULT_DATA;
    });

    const { result } = renderHook(() => usePivotTableQuery(usePivotTableQueryPropsMock));

    await waitFor(() => {
      expect(result.current.jaql).toBe(jaqlMock);
      expect(result.current.error).toBeUndefined();
    });
  });

  it('should handle query error', async () => {
    const mockError = new Error('Test error');
    executePivotQueryMock.mockRejectedValue(mockError);

    const { result } = renderHook(() => usePivotTableQuery(usePivotTableQueryPropsMock));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.jaql).toBeUndefined();
    });
  });

  describe('date measures', () => {
    const dateDimension = createDateDimension({
      name: 'Date',
      expression: '[Commerce.Date (Calendar)]',
    });
    const rangeColor = { type: 'range', minColor: '#d0e8ff', maxColor: '#08519c' } as const;
    // week-of-year has no accessor on a date dimension, so it is built directly
    const weekOfYearAttribute = new DimensionalLevelAttribute(
      'Week of year',
      '[Commerce.Date (Calendar)]',
      DateLevels.WeekOfYear,
    );

    it('turns off data bars and the range colour request for a date measure', () => {
      const { values } = getPivotQueryOptions(
        translatePivotTableDataOptions({
          rows: [mockPivotTableProps.dataOptions.rows![0]],
          values: [
            {
              column: measureFactory.max(dateDimension.Days, 'Max Date'),
              dataBars: true,
              color: rangeColor,
            },
          ],
        }),
      );

      expect(values![0]).toMatchObject({ dataBars: false, shouldRequestMinMax: false });
    });

    it('keeps the data bars and the range colour request on a granularity sent as a number', () => {
      // a week-of-year min/max answers 1 to 53, so the payload sends it as numeric; the hook has to
      // reach the same verdict, or bars that work today are lost
      const { values } = getPivotQueryOptions(
        translatePivotTableDataOptions({
          rows: [mockPivotTableProps.dataOptions.rows![0]],
          values: [
            {
              column: measureFactory.max(weekOfYearAttribute, 'Max Week'),
              dataBars: true,
              color: rangeColor,
            },
          ],
        }),
      );

      expect(values![0]).toMatchObject({ dataBars: true, shouldRequestMinMax: true });
    });

    it('does not warn about a totals calculation that is actually honoured', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      getPivotQueryOptions(
        translatePivotTableDataOptions({
          rows: [mockPivotTableProps.dataOptions.rows![0]],
          values: [
            {
              column: measureFactory.max(weekOfYearAttribute, 'Max Week Totalled'),
              totalsCalculation: 'sum',
            },
          ],
        }),
      );

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('treats a sub-day level as a date, the same as any other level', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { values } = getPivotQueryOptions(
        translatePivotTableDataOptions({
          rows: [mockPivotTableProps.dataOptions.rows![0]],
          values: [
            {
              column: measureFactory.max(dateDimension.AggHours, 'Max Agg Hours'),
              dataBars: true,
              color: rangeColor,
              totalsCalculation: 'sum',
            },
          ],
        }),
      );

      expect(values![0]).toMatchObject({ dataBars: false, shouldRequestMinMax: false });
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it('warns once when a totals calculation is dropped, however many times it is rebuilt', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // a distinct measure name, because the notice is deduplicated once per module load
      const dataOptions = {
        rows: [mockPivotTableProps.dataOptions.rows![0]],
        values: [
          {
            column: measureFactory.max(dateDimension.Days, 'Max Date Warned Once'),
            totalsCalculation: 'sum' as const,
          },
        ],
      };

      // a fresh object each time, the way a parent re-render hands the hook an inline literal
      getPivotQueryOptions(translatePivotTableDataOptions({ ...dataOptions }));
      getPivotQueryOptions(translatePivotTableDataOptions({ ...dataOptions }));

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toMatch(/totals calculation/i);
      warn.mockRestore();
    });

    it('warns for each aggregation when two measures share a name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // the factories allow it, and the warning text names the aggregation, so the two notices
      // differ and both have to be shown
      const sharedName = 'Bound Shared Name';

      getPivotQueryOptions(
        translatePivotTableDataOptions({
          rows: [mockPivotTableProps.dataOptions.rows![0]],
          values: [
            {
              column: measureFactory.min(dateDimension.Days, sharedName),
              totalsCalculation: 'sum',
            },
            {
              column: measureFactory.max(dateDimension.Days, sharedName),
              totalsCalculation: 'sum',
            },
          ],
        }),
      );

      expect(warn).toHaveBeenCalledTimes(2);
      expect(warn.mock.calls[0][0]).toContain('"min"');
      expect(warn.mock.calls[1][0]).toContain('"max"');
      warn.mockRestore();
    });

    it('does not warn when the totals calculation already matches the measure aggregation', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      getPivotQueryOptions(
        translatePivotTableDataOptions({
          rows: [mockPivotTableProps.dataOptions.rows![0]],
          values: [
            {
              column: measureFactory.max(dateDimension.Days, 'Max Date'),
              totalsCalculation: 'max',
            },
          ],
        }),
      );

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('does not warn for a totals calculation on a numeric measure', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      getPivotQueryOptions(
        translatePivotTableDataOptions({
          rows: [mockPivotTableProps.dataOptions.rows![0]],
          values: [
            {
              column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
              totalsCalculation: 'sum',
            },
          ],
        }),
      );

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('leaves data bars and the range colour request on for a numeric measure', () => {
      const { values } = getPivotQueryOptions(
        translatePivotTableDataOptions({
          rows: [mockPivotTableProps.dataOptions.rows![0]],
          values: [
            {
              column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
              dataBars: true,
              color: rangeColor,
            },
          ],
        }),
      );

      expect(values![0]).toMatchObject({ dataBars: true, shouldRequestMinMax: true });
    });
  });
});
