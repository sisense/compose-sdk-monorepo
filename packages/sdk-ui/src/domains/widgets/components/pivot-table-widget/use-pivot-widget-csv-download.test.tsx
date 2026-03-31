import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { translatePivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

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
  const download = header.toolbar?.menu?.items?.find((i) => i.id === 'widget-download');
  return download?.items?.find((i) => i.id === 'widget-download-csv-file')?.onClick;
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
});
