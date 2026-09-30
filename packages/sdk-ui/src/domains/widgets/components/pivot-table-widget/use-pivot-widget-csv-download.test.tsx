import { measureFactory } from '@sisense/sdk-data';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { translatePivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import { translateColumnToMeasure } from '@/domains/visualizations/core/chart-data-options/utils.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets';
import { findMenuActionByPath } from '@/shared/types/__test-helpers__/find-menu-item.js';

import { usePivotWidgetCsvDownload } from './use-pivot-widget-csv-download.js';
import type { UsePivotWidgetCsvDownloadParams } from './use-pivot-widget-csv-download.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/domains/widgets/hooks/use-csv-query-file-loader.js', () => ({
  useCsvQueryFileLoader: () => ({ execute: mockExecute }),
}));

vi.mock('@/domains/visualizations/core/chart-data-options/translate-data-options.js', () => ({
  translatePivotTableDataOptions: vi.fn(),
}));

vi.mock('@/domains/visualizations/core/chart-data-options/utils.js', () => ({
  translateColumnToAttribute: vi.fn((col: unknown) => ({ kind: 'attr', col })),
  translateColumnToMeasure: vi.fn((col: unknown) => ({ kind: 'msr', col })),
}));

function findCsvOnClick(header: WidgetHeaderConfig): (() => void) | undefined {
  return findMenuActionByPath(
    header.menu?.items,
    WidgetHeaderMenuTargets.Download,
    WidgetHeaderMenuTargets.DownloadCsv,
  )?.onClick;
}

const baseParams: UsePivotWidgetCsvDownloadParams = {
  dataOptions: {} as UsePivotWidgetCsvDownloadParams['dataOptions'],
  title: 'Pivot',
  filters: undefined,
  highlights: undefined,
  dataSource: undefined,
  config: { actions: { downloadCsv: { enabled: true } } },
  baseHeaderConfig: {},
};

describe('usePivotWidgetCsvDownload', () => {
  beforeEach(() => {
    mockExecute.mockClear();
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [],
      columns: [],
      values: [],
    } as ReturnType<typeof translatePivotTableDataOptions>);
  });

  it('does not add CSV menu when pivot has no rows, columns, or values', () => {
    const { result } = renderHook(() => usePivotWidgetCsvDownload(baseParams));

    expect(findCsvOnClick(result.current.headerConfig)).toBeUndefined();
  });

  it('adds CSV menu and runs loader with translated pivot dimensions and measures', async () => {
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [{ id: 'r1' } as never],
      columns: [{ id: 'c1' } as never],
      values: [{ id: 'v1' } as never],
    } as ReturnType<typeof translatePivotTableDataOptions>);

    const { result } = renderHook(() => usePivotWidgetCsvDownload(baseParams));

    await act(async () => {
      findCsvOnClick(result.current.headerConfig)?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: [
          { kind: 'attr', col: { id: 'r1' } },
          { kind: 'attr', col: { id: 'c1' } },
        ],
        measures: [{ kind: 'msr', col: { id: 'v1' } }],
        filename: 'Pivot.csv',
      }),
    );
  });

  it('gives a date measure its display format and passes other measures through by identity', async () => {
    const dateMeasure = measureFactory.max(DM.Commerce.Date.Days, 'Max Date');
    const numeric = measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue');
    vi.mocked(translatePivotTableDataOptions).mockReturnValue({
      rows: [],
      columns: [],
      values: [{ column: dateMeasure }, { column: numeric }],
    });
    vi.mocked(translateColumnToMeasure).mockImplementation(
      (col: unknown) => (col as { column: unknown }).column as never,
    );

    const { result } = renderHook(() => usePivotWidgetCsvDownload(baseParams));
    await act(async () => {
      findCsvOnClick(result.current.headerConfig)?.();
    });

    const { measures } = mockExecute.mock.calls[0][0];
    expect(measures[0].getFormat()).toBe('yyyy-MM-dd');
    expect(measures[1]).toBe(numeric);
  });
});
