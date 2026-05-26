import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

import { useWithExcelDownloadMenuItem } from './use-with-excel-download-menu-item.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useWithExcelDownloadMenuItem', () => {
  it('returns base header config when disabled', () => {
    const base: WidgetHeaderConfig = {
      toolbar: { menu: { items: [{ id: 'other', caption: 'Other' }] } },
    };
    const onDownloadExcel = vi.fn();

    const { result } = renderHook(() =>
      useWithExcelDownloadMenuItem({ baseHeaderConfig: base, enabled: false, onDownloadExcel }),
    );

    expect(result.current).toEqual(base);
  });

  it('appends a Download group with Excel subtree when no download group exists', () => {
    const base: WidgetHeaderConfig = {};
    const onDownloadExcel = vi.fn();

    const { result } = renderHook(() =>
      useWithExcelDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onDownloadExcel }),
    );

    const items = result.current.toolbar?.menu?.items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: 'widget-download',
      caption: 'widgetHeader.menu.download',
    });
    const excelFile = items[0]?.items?.[0];
    expect(excelFile).toMatchObject({
      id: 'excelFileMenuItem',
      caption: 'widgetHeader.menu.excelFile',
    });
    const repeatRows = excelFile?.items?.[0];
    const mergeRows = excelFile?.items?.[1];
    expect(repeatRows).toMatchObject({ id: 'downloadExcelRepeatRows' });
    expect(mergeRows).toMatchObject({ id: 'downloadExcelMergeRows' });
    repeatRows?.onClick?.();
    expect(onDownloadExcel).toHaveBeenCalledWith(false);
    mergeRows?.onClick?.();
    expect(onDownloadExcel).toHaveBeenCalledWith(true);
  });

  it('adds Excel branch under existing widget-download group', () => {
    const base: WidgetHeaderConfig = {
      toolbar: {
        menu: {
          items: [
            {
              id: 'widget-download',
              caption: 'widgetHeader.menu.download',
              items: [{ id: 'widget-download-csv-file', caption: 'CSV' }],
            },
          ],
        },
      },
    };
    const onDownloadExcel = vi.fn();

    const { result } = renderHook(() =>
      useWithExcelDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onDownloadExcel }),
    );

    const downloadGroup = result.current.toolbar?.menu?.items?.[0];
    expect(downloadGroup?.items).toHaveLength(2);
    expect(downloadGroup?.items?.[1]).toMatchObject({ id: 'excelFileMenuItem' });
  });

  it('keeps a single excelFileMenuItem when one already exists under widget-download', () => {
    const staleOnDownload = vi.fn();
    const base: WidgetHeaderConfig = {
      toolbar: {
        menu: {
          items: [
            {
              id: 'widget-download',
              caption: 'widgetHeader.menu.download',
              items: [
                { id: 'widget-download-csv-file', caption: 'CSV' },
                {
                  id: 'excelFileMenuItem',
                  caption: 'widgetHeader.menu.excelFile',
                  items: [
                    {
                      id: 'downloadExcelRepeatRows',
                      caption: 'widgetHeader.menu.repeatRowsRecommended',
                      onClick: () => staleOnDownload(false),
                    },
                    {
                      id: 'downloadExcelMergeRows',
                      caption: 'widgetHeader.menu.mergeRows',
                      onClick: () => staleOnDownload(true),
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
    const onDownloadExcel = vi.fn();

    const { result } = renderHook(() =>
      useWithExcelDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onDownloadExcel }),
    );

    const downloadGroup = result.current.toolbar?.menu?.items?.[0];
    const excelLeaves = downloadGroup?.items?.filter((i) => i.id === 'excelFileMenuItem') ?? [];
    expect(excelLeaves).toHaveLength(1);
    expect(downloadGroup?.items).toHaveLength(2);

    const excelFile = excelLeaves[0];
    excelFile?.items?.[0]?.onClick?.();
    excelFile?.items?.[1]?.onClick?.();
    expect(onDownloadExcel).toHaveBeenCalledWith(false);
    expect(onDownloadExcel).toHaveBeenCalledWith(true);
    expect(staleOnDownload).not.toHaveBeenCalled();
  });
});
