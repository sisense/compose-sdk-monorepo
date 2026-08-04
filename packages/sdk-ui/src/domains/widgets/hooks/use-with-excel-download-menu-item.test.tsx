import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets';
import {
  findMenuActionByPath,
  findMenuItemByPath,
} from '@/shared/types/__test-helpers__/find-menu-item.js';
import { isMenuSubmenuItem, type MenuItem } from '@/shared/types/menu-item.js';

import { useWithExcelDownloadMenuItem } from './use-with-excel-download-menu-item.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

/** Children of a submenu found by id path, or `[]` when missing / not a submenu. */
const childrenAt = (items: MenuItem[] | undefined, ...ids: string[]): MenuItem[] => {
  const match = findMenuItemByPath(items, ...ids);
  return match && isMenuSubmenuItem(match) ? match.items : [];
};

describe('useWithExcelDownloadMenuItem', () => {
  it('returns base header config when disabled', () => {
    const base: WidgetHeaderConfig = {
      menu: { items: [{ type: 'action', id: 'other', caption: 'Other', onClick: vi.fn() }] },
    };
    const onDownloadExcel = vi.fn();

    const { result } = renderHook(() =>
      useWithExcelDownloadMenuItem({ baseHeaderConfig: base, enabled: false, onDownloadExcel }),
    );

    expect(result.current).toEqual(base);
  });

  it('appends a Download submenu with the Excel subtree when no download submenu exists', () => {
    const base: WidgetHeaderConfig = {};
    const onDownloadExcel = vi.fn();

    const { result } = renderHook(() =>
      useWithExcelDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onDownloadExcel }),
    );

    const items = result.current.menu?.items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      type: 'submenu',
      id: WidgetHeaderMenuTargets.Download,
      caption: 'widgetHeader.menu.download',
    });
    expect(
      findMenuItemByPath(
        items,
        WidgetHeaderMenuTargets.Download,
        WidgetHeaderMenuTargets.DownloadExcel,
      ),
    ).toMatchObject({
      type: 'submenu',
      id: WidgetHeaderMenuTargets.DownloadExcel,
      caption: 'widgetHeader.menu.excelFile',
    });

    const repeatRows = findMenuActionByPath(
      items,
      WidgetHeaderMenuTargets.Download,
      WidgetHeaderMenuTargets.DownloadExcel,
      WidgetHeaderMenuTargets.DownloadExcelRepeatRows,
    );
    const mergeRows = findMenuActionByPath(
      items,
      WidgetHeaderMenuTargets.Download,
      WidgetHeaderMenuTargets.DownloadExcel,
      WidgetHeaderMenuTargets.DownloadExcelMergeRows,
    );
    expect(repeatRows).toBeDefined();
    expect(mergeRows).toBeDefined();

    repeatRows?.onClick();
    expect(onDownloadExcel).toHaveBeenCalledWith(false);
    mergeRows?.onClick();
    expect(onDownloadExcel).toHaveBeenCalledWith(true);
  });

  it('adds the Excel branch under an existing Download submenu', () => {
    const base: WidgetHeaderConfig = {
      menu: {
        items: [
          {
            type: 'submenu',
            id: WidgetHeaderMenuTargets.Download,
            caption: 'widgetHeader.menu.download',
            items: [
              {
                type: 'action',
                id: WidgetHeaderMenuTargets.DownloadCsv,
                caption: 'CSV',
                onClick: vi.fn(),
              },
            ],
          },
        ],
      },
    };
    const onDownloadExcel = vi.fn();

    const { result } = renderHook(() =>
      useWithExcelDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onDownloadExcel }),
    );

    const downloadChildren = childrenAt(
      result.current.menu?.items,
      WidgetHeaderMenuTargets.Download,
    );
    expect(downloadChildren).toHaveLength(2);
    expect(downloadChildren[1]).toMatchObject({ id: WidgetHeaderMenuTargets.DownloadExcel });
  });

  it('keeps a single Excel entry when one already exists under Download', () => {
    const staleOnDownload = vi.fn();
    const base: WidgetHeaderConfig = {
      menu: {
        items: [
          {
            type: 'submenu',
            id: WidgetHeaderMenuTargets.Download,
            caption: 'widgetHeader.menu.download',
            items: [
              {
                type: 'action',
                id: WidgetHeaderMenuTargets.DownloadCsv,
                caption: 'CSV',
                onClick: vi.fn(),
              },
              {
                type: 'submenu',
                id: WidgetHeaderMenuTargets.DownloadExcel,
                caption: 'widgetHeader.menu.excelFile',
                items: [
                  {
                    type: 'action',
                    id: WidgetHeaderMenuTargets.DownloadExcelRepeatRows,
                    caption: 'widgetHeader.menu.repeatRowsRecommended',
                    onClick: () => staleOnDownload(false),
                  },
                  {
                    type: 'action',
                    id: WidgetHeaderMenuTargets.DownloadExcelMergeRows,
                    caption: 'widgetHeader.menu.mergeRows',
                    onClick: () => staleOnDownload(true),
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    const onDownloadExcel = vi.fn();

    const { result } = renderHook(() =>
      useWithExcelDownloadMenuItem({ baseHeaderConfig: base, enabled: true, onDownloadExcel }),
    );

    const downloadChildren = childrenAt(
      result.current.menu?.items,
      WidgetHeaderMenuTargets.Download,
    );
    expect(
      downloadChildren.filter((item) => item.id === WidgetHeaderMenuTargets.DownloadExcel),
    ).toHaveLength(1);
    expect(downloadChildren).toHaveLength(2);

    findMenuActionByPath(
      result.current.menu?.items,
      WidgetHeaderMenuTargets.Download,
      WidgetHeaderMenuTargets.DownloadExcel,
      WidgetHeaderMenuTargets.DownloadExcelRepeatRows,
    )?.onClick();
    findMenuActionByPath(
      result.current.menu?.items,
      WidgetHeaderMenuTargets.Download,
      WidgetHeaderMenuTargets.DownloadExcel,
      WidgetHeaderMenuTargets.DownloadExcelMergeRows,
    )?.onClick();

    expect(onDownloadExcel).toHaveBeenCalledWith(false);
    expect(onDownloadExcel).toHaveBeenCalledWith(true);
    expect(staleOnDownload).not.toHaveBeenCalled();
  });
});
