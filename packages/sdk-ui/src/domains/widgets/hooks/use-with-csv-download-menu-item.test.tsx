import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets';
import {
  findMenuActionByPath,
  findMenuItemByPath,
} from '@/shared/types/__test-helpers__/find-menu-item.js';
import { isMenuSubmenuItem } from '@/shared/types/menu-item.js';

import { useWithCsvDownloadMenuItem } from './use-with-csv-download-menu-item.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useWithCsvDownloadMenuItem', () => {
  it('returns base header config when disabled', () => {
    const base: WidgetHeaderConfig = {
      menu: { items: [{ type: 'action', id: 'other', caption: 'Other', onClick: vi.fn() }] },
    };
    const onClick = vi.fn();

    const { result } = renderHook(() =>
      useWithCsvDownloadMenuItem({ baseHeaderConfig: base, enabled: false, onClick }),
    );

    expect(result.current).toEqual(base);
  });

  it('appends a Download submenu with a CSV item when no download submenu exists', () => {
    const base: WidgetHeaderConfig = {};
    const onClick = vi.fn();

    const { result } = renderHook(() =>
      useWithCsvDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onClick }),
    );

    const items = result.current.menu?.items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      type: 'submenu',
      id: WidgetHeaderMenuTargets.Download,
      caption: 'widgetHeader.menu.download',
    });

    const csvItem = findMenuActionByPath(
      items,
      WidgetHeaderMenuTargets.Download,
      WidgetHeaderMenuTargets.DownloadCsv,
    );
    expect(csvItem).toMatchObject({
      type: 'action',
      id: WidgetHeaderMenuTargets.DownloadCsv,
      caption: 'widgetHeader.menu.csvFile',
    });

    csvItem?.onClick();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('adds the CSV item under an existing Download submenu', () => {
    const base: WidgetHeaderConfig = {
      menu: {
        items: [
          {
            type: 'submenu',
            id: WidgetHeaderMenuTargets.Download,
            caption: 'widgetHeader.menu.download',
            items: [{ type: 'action', id: 'existing', caption: 'Existing', onClick: vi.fn() }],
          },
        ],
      },
    };
    const onClick = vi.fn();

    const { result } = renderHook(() =>
      useWithCsvDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onClick }),
    );

    const downloadGroup = findMenuItemByPath(
      result.current.menu?.items,
      WidgetHeaderMenuTargets.Download,
    );
    expect(
      downloadGroup && isMenuSubmenuItem(downloadGroup) ? downloadGroup.items : [],
    ).toHaveLength(2);
    expect(
      findMenuItemByPath(
        result.current.menu?.items,
        WidgetHeaderMenuTargets.Download,
        WidgetHeaderMenuTargets.DownloadCsv,
      ),
    ).toBeDefined();
  });
});
