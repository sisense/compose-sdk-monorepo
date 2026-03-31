import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import type { MenuItem } from '@/shared/types/menu-item.js';

const DOWNLOAD_MENU_ITEM_ID = 'widget-download';
const CSV_FILE_MENU_ITEM_ID = 'widget-download-csv-file';

export type UseWithCsvDownloadMenuParams = {
  /** Base header config. */
  baseHeaderConfig: WidgetHeaderConfig;
  /** Whether the "Download CSV" menu item is enabled. */
  enabled: boolean;
  /** Triggers CSV query execution and browser download. */
  onClick: () => void;
};

/**
 * Appends a "Download > CSV File" item to the widget header menu when enabled.
 *
 * If a "Download" group already exists in the menu, the "CSV File" item is added to its `items`.
 * Otherwise a new "Download" group containing "CSV File" is appended.
 *
 * @param params.baseHeaderConfig - Base header config.
 * @param params.enabled - Whether the "Download CSV" menu item is enabled.
 * @param params.onClick - Click handler for the "CSV File" leaf item.
 * @returns Header config to pass to {@link WidgetContainer}
 * @internal
 */
export function useWithCsvDownloadMenuItem({
  baseHeaderConfig,
  enabled,
  onClick,
}: UseWithCsvDownloadMenuParams): WidgetHeaderConfig {
  const { t } = useTranslation();
  return useMemo(() => {
    if (!enabled) {
      return baseHeaderConfig;
    }

    const csvFileItem: MenuItem = {
      id: CSV_FILE_MENU_ITEM_ID,
      caption: t('widgetHeader.menu.csvFile'),
      onClick,
    };
    const existingItems = baseHeaderConfig.toolbar?.menu?.items ?? [];
    const downloadGroupIndex = existingItems.findIndex((item) => item.id === DOWNLOAD_MENU_ITEM_ID);

    const updatedItems =
      downloadGroupIndex >= 0
        ? existingItems.map((item, index) =>
            index === downloadGroupIndex
              ? { ...item, items: [...(item.items ?? []), csvFileItem] }
              : item,
          )
        : [
            ...existingItems,
            {
              id: DOWNLOAD_MENU_ITEM_ID,
              caption: t('widgetHeader.menu.download'),
              items: [csvFileItem],
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
  }, [baseHeaderConfig, enabled, onClick, t]);
}
