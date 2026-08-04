import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { withBuiltInMenuItem } from '@/domains/widgets/helpers/header-menu-utils.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets.js';
import { isMenuSubmenuItem, type MenuItem } from '@/shared/types/menu-item.js';

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
 * If a **Download** group already exists (e.g. after CSV), the **Excel File** branch is appended to its `items` (any prior **Excel File** entry is removed first so it is not duplicated).
 * Otherwise a new **Download** group containing only the Excel subtree is added to the built-in block.
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
      type: 'action',
      id: WidgetHeaderMenuTargets.DownloadExcelRepeatRows,
      caption: t('widgetHeader.menu.repeatRowsRecommended'),
      onClick: () => onDownloadExcel(false),
    };
    const mergeRowsItem: MenuItem = {
      type: 'action',
      id: WidgetHeaderMenuTargets.DownloadExcelMergeRows,
      caption: t('widgetHeader.menu.mergeRows'),
      onClick: () => onDownloadExcel(true),
    };
    const excelFileMenuItem: MenuItem = {
      type: 'submenu',
      id: WidgetHeaderMenuTargets.DownloadExcel,
      caption: t('widgetHeader.menu.excelFile'),
      items: [repeatRowsItem, mergeRowsItem],
    };

    const existingItems = baseHeaderConfig.menu?.items ?? [];
    const downloadGroupIndex = existingItems.findIndex(
      (item) => item.id === WidgetHeaderMenuTargets.Download,
    );

    const updatedItems =
      downloadGroupIndex >= 0
        ? existingItems.map((item, index) =>
            index === downloadGroupIndex && isMenuSubmenuItem(item)
              ? {
                  ...item,
                  items: [
                    ...item.items.filter(
                      (child) => child.id !== WidgetHeaderMenuTargets.DownloadExcel,
                    ),
                    excelFileMenuItem,
                  ],
                }
              : item,
          )
        : withBuiltInMenuItem(existingItems, {
            type: 'submenu',
            id: WidgetHeaderMenuTargets.Download,
            caption: t('widgetHeader.menu.download'),
            items: [excelFileMenuItem],
          });

    return {
      ...baseHeaderConfig,
      menu: {
        ...(baseHeaderConfig.menu ?? {}),
        items: updatedItems,
      },
    };
  }, [baseHeaderConfig, enabled, onDownloadExcel, t]);
}
