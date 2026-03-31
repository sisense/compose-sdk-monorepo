import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

import { useWithCsvDownloadMenuItem } from './use-with-csv-download-menu-item.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useWithCsvDownloadMenuItem', () => {
  it('returns base header config when disabled', () => {
    const base: WidgetHeaderConfig = {
      toolbar: { menu: { items: [{ id: 'other', caption: 'Other' }] } },
    };
    const onClick = vi.fn();

    const { result } = renderHook(() =>
      useWithCsvDownloadMenuItem({ baseHeaderConfig: base, enabled: false, onClick }),
    );

    expect(result.current).toEqual(base);
  });

  it('appends a Download group with CSV item when no download group exists', () => {
    const base: WidgetHeaderConfig = {};
    const onClick = vi.fn();

    const { result } = renderHook(() =>
      useWithCsvDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onClick }),
    );

    const items = result.current.toolbar?.menu?.items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: 'widget-download',
      caption: 'widgetHeader.menu.download',
    });
    const csvItem = items[0]?.items?.[0];
    expect(csvItem).toMatchObject({
      id: 'widget-download-csv-file',
      caption: 'widgetHeader.menu.csvFile',
    });
    csvItem?.onClick?.();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('adds CSV item under existing widget-download group', () => {
    const base: WidgetHeaderConfig = {
      toolbar: {
        menu: {
          items: [
            {
              id: 'widget-download',
              caption: 'widgetHeader.menu.download',
              items: [{ id: 'existing', caption: 'Existing' }],
            },
          ],
        },
      },
    };
    const onClick = vi.fn();

    const { result } = renderHook(() =>
      useWithCsvDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onClick }),
    );

    const downloadGroup = result.current.toolbar?.menu?.items?.[0];
    expect(downloadGroup?.items).toHaveLength(2);
    expect(downloadGroup?.items?.[1]).toMatchObject({ id: 'widget-download-csv-file' });
  });
});
