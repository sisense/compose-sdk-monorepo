import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { extractDimensionsAndMeasures } from '@/infra/contexts/custom-widgets-provider/use-execute-custom-widget-query.js';

import { useCustomWidgetCsvDownload } from './use-custom-widget-csv-download.js';
import type { UseCustomWidgetCsvDownloadParams } from './use-custom-widget-csv-download.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/domains/widgets/hooks/use-csv-query-file-loader.js', () => ({
  useCsvQueryFileLoader: () => ({ execute: mockExecute }),
}));

vi.mock('@/infra/contexts/custom-widgets-provider/use-execute-custom-widget-query.js', () => ({
  extractDimensionsAndMeasures: vi.fn(),
}));

function findCsvOnClick(header: WidgetHeaderConfig): (() => void) | undefined {
  const download = header.toolbar?.menu?.items?.find((i) => i.id === 'widget-download');
  return download?.items?.find((i) => i.id === 'widget-download-csv-file')?.onClick;
}

const baseParams: UseCustomWidgetCsvDownloadParams = {
  dataOptions: {},
  title: 'Custom',
  filters: undefined,
  highlights: undefined,
  dataSource: undefined,
  config: { actions: { downloadCsv: { enabled: true } } },
};

describe('useCustomWidgetCsvDownload', () => {
  beforeEach(() => {
    mockExecute.mockClear();
    vi.mocked(extractDimensionsAndMeasures).mockReturnValue({ dimensions: [], measures: [] });
  });

  it('does not expose CSV download when there are no dimensions or measures', () => {
    const { result } = renderHook(() => useCustomWidgetCsvDownload(baseParams));

    expect(findCsvOnClick(result.current.headerConfig)).toBeUndefined();
  });

  it('exposes CSV download and passes extracted dimensions and measures to the loader', async () => {
    vi.mocked(extractDimensionsAndMeasures).mockReturnValue({
      dimensions: [{ name: 'd' } as never],
      measures: [{ name: 'm' } as never],
    });

    const { result } = renderHook(() => useCustomWidgetCsvDownload(baseParams));

    await act(async () => {
      findCsvOnClick(result.current.headerConfig)?.();
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: [{ name: 'd' }],
        measures: [{ name: 'm' }],
        filename: 'Custom.csv',
      }),
    );
  });
});
