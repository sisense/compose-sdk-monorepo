import { useMemo } from 'react';

import type { WidgetChangeEvent } from '@/domains/widgets/change-events.js';
import { withMenuItemInHeaderConfig } from '@/domains/widgets/helpers/header-menu-utils.js';
import { useTitleRenaming } from '@/domains/widgets/hooks/use-title-renaming.js';
import type {
  TitleEditorConfig,
  WidgetHeaderConfig,
} from '@/domains/widgets/shared/widget-header/types.js';

/** Parameters for the widget header management hook. */
export type UseWidgetHeaderManagementParams = {
  /** Current title (from props). */
  title?: string;
  /** onChange handler (from props). */
  onChange?: (event: WidgetChangeEvent) => void;
  /** Merged config.header from props (may already have toolbar.menu.items). */
  headerConfig?: WidgetHeaderConfig;
};

/** Result of the widget header management hook. */
export type UseWidgetHeaderManagementResult = {
  /** Merged header config (e.g. rename menu in toolbar). */
  headerConfig: WidgetHeaderConfig;
  /** Inline title editor config when rename is enabled. Pass to WidgetContainer as separate prop. */
  titleEditor?: TitleEditorConfig;
};

/**
 * Hook that manages widget header UI for rename: adds "Rename" menu item
 * and delegates inline title editing to useTitleRenaming.
 * Used by ChartWidget and PivotTableWidget when config.header.title.editing.enabled is true.
 *
 * @param params - Hook parameters
 * @returns Merged header config to pass to WidgetContainer
 * @internal
 */
export function useWidgetHeaderManagement(
  params: UseWidgetHeaderManagementParams,
): UseWidgetHeaderManagementResult {
  const { onChange, headerConfig } = params;
  const effectiveRenameEnabled = headerConfig?.title?.editing?.enabled ?? false;

  const { renameMenuItem, titleEditorConfig } = useTitleRenaming({
    enabled: effectiveRenameEnabled,
    onChange,
  });

  const headerConfigWithRename = useMemo((): WidgetHeaderConfig => {
    if (!effectiveRenameEnabled || !renameMenuItem) {
      return headerConfig ?? {};
    }
    return withMenuItemInHeaderConfig(renameMenuItem)(headerConfig ?? {});
  }, [effectiveRenameEnabled, headerConfig, renameMenuItem]);

  const resultConfig = effectiveRenameEnabled ? headerConfigWithRename : headerConfig ?? {};

  return {
    headerConfig: resultConfig,
    titleEditor: titleEditorConfig,
  };
}
