import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { withBuiltInMenuItem } from '@/domains/widgets/helpers/header-menu-utils.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets.js';
import { isMenuSubmenuItem, type MenuItem } from '@/shared/types/menu-item.js';

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
 * Otherwise a new "Download" group containing "CSV File" is added to the built-in block.
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
      type: 'action',
      id: WidgetHeaderMenuTargets.DownloadCsv,
      caption: t('widgetHeader.menu.csvFile'),
      onClick,
    };
    const existingItems = baseHeaderConfig.menu?.items ?? [];
    const downloadGroupIndex = existingItems.findIndex(
      (item) => item.id === WidgetHeaderMenuTargets.Download,
    );

    const updatedItems =
      downloadGroupIndex >= 0
        ? existingItems.map((item, index) =>
            index === downloadGroupIndex && isMenuSubmenuItem(item)
              ? { ...item, items: [...item.items, csvFileItem] }
              : item,
          )
        : withBuiltInMenuItem(existingItems, {
            type: 'submenu',
            id: WidgetHeaderMenuTargets.Download,
            caption: t('widgetHeader.menu.download'),
            items: [csvFileItem],
          });

    return {
      ...baseHeaderConfig,
      menu: {
        ...(baseHeaderConfig.menu ?? {}),
        items: updatedItems,
      },
    };
  }, [baseHeaderConfig, enabled, onClick, t]);
}
