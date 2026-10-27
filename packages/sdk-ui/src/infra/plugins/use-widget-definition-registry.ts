import { useContext } from 'react';

import { PLUGIN_CONTEXT_MISSING_MESSAGE, PluginContext } from './plugin-context.js';

/**
 * Hook for accessing the widget definition registry.
 * Used internally by the CustomWidget renderer to look up components.
 *
 * @returns The registry of the nearest `PluginProvider`.
 *
 * @internal
 */
export const useWidgetDefinitionRegistry = () => {
  const context = useContext(PluginContext);
  if (context === null) {
    throw new Error(PLUGIN_CONTEXT_MISSING_MESSAGE);
  }
  return context.widgetRegistry;
};
