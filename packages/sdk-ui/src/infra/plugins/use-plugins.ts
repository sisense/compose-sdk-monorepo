import { useCallback, useContext } from 'react';

import { PLUGIN_CONTEXT_MISSING_MESSAGE, PluginContext } from './plugin-context.js';
import type { Plugin } from './types.js';

/**
 * Hook that provides read-only access to registered plugins.
 *
 * @sisenseInternal
 */
export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (context === null) {
    throw new Error(PLUGIN_CONTEXT_MISSING_MESSAGE);
  }
  const { widgetPlugins } = context;

  const hasPlugin = useCallback(
    (name: string) => widgetPlugins.some((p) => p.name === name),
    [widgetPlugins],
  );

  const getPlugin = useCallback(
    (name: string): Plugin | undefined => widgetPlugins.find((p) => p.name === name),
    [widgetPlugins],
  );

  return {
    hasPlugin,
    getPlugin,
  };
};
