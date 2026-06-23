import { useMemo } from 'react';

import { resolveHeaderItems, ResolveHeaderItemsOptions } from './resolve-header-items.js';
import { HeaderConfig, HeaderItem, ResolvedHeaderItem } from './types.js';

/**
 * Memoized React hook wrapper around {@link resolveHeaderItems}.
 *
 * Recomputes only when the built-in items, the user config, or the auto-anchor change.
 *
 * @internal
 */
export const useResolvedHeaderItems = (
  builtInItems: HeaderItem[],
  config?: HeaderConfig,
  options?: ResolveHeaderItemsOptions,
): ResolvedHeaderItem[] => {
  const autoAnchorId = options?.autoAnchorId;
  return useMemo(
    () => resolveHeaderItems(builtInItems, config, { autoAnchorId }),
    [builtInItems, config, autoAnchorId],
  );
};
