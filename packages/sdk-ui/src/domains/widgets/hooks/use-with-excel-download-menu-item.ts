import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import type { MenuItem } from '@/shared/types/menu-item.js';

const DOWNLOAD_MENU_ITEM_ID = 'widget-download';
const EXCEL_FILE_MENU_ITEM_ID = 'excelFileMenuItem';
const DOWNLOAD_EXCEL_REPEAT_ROWS_MENU_ITEM_ID = 'downloadExcelRepeatRows';
const DOWNLOAD_EXCEL_MERGE_ROWS_MENU_ITEM_ID = 'downloadExcelMergeRows';

export type UseWithExcelDownloadMenuParams = {
  /** Base header config. */
  baseHeaderConfig: WidgetHeaderConfig;
  /** Whether Excel download menu items are shown. */
  enabled: boolean;
  /** Triggers Excel download; receives `mergeRows` flag (Angular: `buildRequest(..., mergeRows)`). */
  onDownloadExcel: (mergeRows: boolean) => void;
};

/**
 * Appends **Download → Excel File → (Repeat rows | Merge rows)** to the widget header menu when enabled.
 *
 * If a **Download** group (`widget-download`) already exists (e.g. after CSV), the **Excel File** branch is appended to its `items` (any prior `excelFileMenuItem` entry is removed first so it is not duplicated).
 * Otherwise a new **Download** group containing only the Excel subtree is appended.
 *
 * @param params.baseHeaderConfig - Base header config.
 * @param params.enabled - When false, returns `baseHeaderConfig` unchanged.
 * @param params.onDownloadExcel - Invoked with `mergeRows` false for "Repeat rows", true for "Merge rows".
 * @returns Header config to pass to {@link WidgetContainer}
 */
export function useWithExcelDownloadMenuItem({
  baseHeaderConfig,
  enabled,
  onDownloadExcel,
}: UseWithExcelDownloadMenuParams): WidgetHeaderConfig {
  const { t } = useTranslation();
  return useMemo(() => {
    if (!enabled) {
      return baseHeaderConfig;
    }

    const repeatRowsItem: MenuItem = {
      id: DOWNLOAD_EXCEL_REPEAT_ROWS_MENU_ITEM_ID,
      caption: t('widgetHeader.menu.repeatRowsRecommended'),
      onClick: () => onDownloadExcel(false),
    };
    const mergeRowsItem: MenuItem = {
      id: DOWNLOAD_EXCEL_MERGE_ROWS_MENU_ITEM_ID,
      caption: t('widgetHeader.menu.mergeRows'),
      onClick: () => onDownloadExcel(true),
    };
    const excelFileMenuItem: MenuItem = {
      id: EXCEL_FILE_MENU_ITEM_ID,
      caption: t('widgetHeader.menu.excelFile'),
      items: [repeatRowsItem, mergeRowsItem],
    };

    const existingItems = baseHeaderConfig.toolbar?.menu?.items ?? [];
    const downloadGroupIndex = existingItems.findIndex((item) => item.id === DOWNLOAD_MENU_ITEM_ID);

    const updatedItems =
      downloadGroupIndex >= 0
        ? existingItems.map((item, index) =>
            index === downloadGroupIndex
              ? {
                  ...item,
                  items: [
                    ...(item.items ?? []).filter((child) => child.id !== EXCEL_FILE_MENU_ITEM_ID),
                    excelFileMenuItem,
                  ],
                }
              : item,
          )
        : [
            ...existingItems,
            {
              id: DOWNLOAD_MENU_ITEM_ID,
              caption: t('widgetHeader.menu.download'),
              items: [excelFileMenuItem],
            },
          ];

    return {
      ...baseHeaderConfig,
      toolbar: {
        ...baseHeaderConfig.toolbar,
        menu: {
          ...(baseHeaderConfig.toolbar?.menu ?? {}),
          items: updatedItems,
        },
      },
    };
  }, [baseHeaderConfig, enabled, onDownloadExcel, t]);
}
