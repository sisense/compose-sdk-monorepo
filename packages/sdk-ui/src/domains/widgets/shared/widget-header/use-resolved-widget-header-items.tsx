import { useMemo } from 'react';

import {
  partitionBuiltInHeaderItems,
  ResolvedHeaderItem,
  useResolvedHeaderItems,
} from '@/domains/shared/header';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { WidgetContainerStyleOptions } from '@/types';

import { WidgetHeaderConfig } from './types.js';
import { buildWidgetHeaderSkeleton } from './widget-header-slots.js';
import { createWidgetHeaderSpacerItems } from './widget-header-spacers.js';
import { WidgetHeaderTargets } from './widget-header-targets.js';

/**
 * Params for {@link useResolvedWidgetHeaderItems}.
 */
export interface UseResolvedWidgetHeaderItemsParams {
  /** Header configuration: every item that lands in the header, plus `onBeforeRender`. */
  config?: WidgetHeaderConfig;
  /** Style options for the widget header; `titleAlignment` decides which spacer grows. */
  styleOptions?: WidgetContainerStyleOptions['header'];
}

/**
 * Resolves a widget header's final, ordered item list.
 *
 * The header itself owns no content — only layout. It builds the two spacers (which is how
 * `titleAlignment` positions the title) and then places everything else by the slot order:
 *
 * ```text
 * [ DragIcon ][ JtdIcon ][ TitleAlignmentSpacer ][ Title ][ Spacer ]
 *   [ ClearSelectionButton ][ InfoButton ][ NarrativeToggle ][ Menu ]
 * ```
 *
 * Every item arrives through one channel — `config.items` — and what it is decides how it is placed:
 * a **marked** entry (`asBuiltInHeaderItem`) claims its reserved slot, whether the widget composed it
 * from a feature hook or a dashboard-level feature contributed it by transforming widget props; an
 * unmarked entry is the consumer's and is positioned by its `position`. Slots nothing filled become
 * hidden anchors, so `before`/`after` targeting them keeps resolving, and the result is handed to
 * `onBeforeRender`.
 *
 * @param params - The widget's items, its header config and header style options.
 * @returns The ordered items to render.
 * @internal
 */
export const useResolvedWidgetHeaderItems = ({
  config,
  styleOptions,
}: UseResolvedWidgetHeaderItemsParams): ResolvedHeaderItem[] => {
  const { themeSettings } = useThemeContext();

  const { builtInItems: contributedItems, userItems } = useMemo(
    () => partitionBuiltInHeaderItems(config?.items),
    [config?.items],
  );

  const titleAlignment = styleOptions?.titleAlignment || themeSettings.widget.header.titleAlignment;
  const spacerItems = useMemo(
    () => createWidgetHeaderSpacerItems(titleAlignment),
    [titleAlignment],
  );

  const skeleton = useMemo(
    () =>
      buildWidgetHeaderSkeleton(
        [spacerItems.titleAlignmentSpacerItem, spacerItems.spacerItem],
        contributedItems,
      ),
    [spacerItems, contributedItems],
  );

  // Only the consumer's items go through positioning and reserved-id validation; every marked item
  // has already been placed into its slot.
  const resolverConfig = useMemo<WidgetHeaderConfig | undefined>(
    () => config && { ...config, items: userItems },
    [config, userItems],
  );

  return useResolvedHeaderItems(skeleton, resolverConfig, {
    autoAnchorId: WidgetHeaderTargets.Spacer,
  });
};
