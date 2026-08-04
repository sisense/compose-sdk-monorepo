import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets';
import { extractDimensionsAndMeasures } from '@/infra/contexts/custom-widgets-provider/use-execute-custom-widget-query.js';
import { findMenuActionByPath } from '@/shared/types/__test-helpers__/find-menu-item.js';

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
  return findMenuActionByPath(
    header.menu?.items,
    WidgetHeaderMenuTargets.Download,
    WidgetHeaderMenuTargets.DownloadCsv,
  )?.onClick;
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

  it('exposes CSV download and passes extracted dimensions and measures to the loader', () => {
    vi.mocked(extractDimensionsAndMeasures).mockReturnValue({
      dimensions: [{ name: 'd' } as never],
      measures: [{ name: 'm' } as never],
    });

    const { result } = renderHook(() => useCustomWidgetCsvDownload(baseParams));

    act(() => {
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
