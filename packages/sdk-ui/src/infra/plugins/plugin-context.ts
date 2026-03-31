import { createContext } from 'react';

import { WidgetPlugin } from './widget-plugins/types.js';
import type { WidgetPluginRegistry } from './widget-plugins/widget-plugin-registry.js';

/**
 * Context for accessing registered plugins
 *
 * @internal
 */
export interface PluginContextValue {
  /**
   * Validated widget plugin declarations (metadata)
   */
  widgetPlugins: readonly WidgetPlugin[];
  /**
   * Central widget component registry (used for lookup and legacy bridge)
   */
  widgetRegistry: WidgetPluginRegistry;
}

/**
 * Error message when a plugin hook/component is used outside PluginProvider.
 * @internal
 */
export const PLUGIN_CONTEXT_MISSING_MESSAGE =
  'PluginContext is missing. Ensure PluginProvider (or a compatible provider) is an ancestor.';

/**
 * React context for plugin management.
 * Default is null to avoid a shared WidgetPluginRegistry at module load (cross-test/consumer pollution).
 * PluginProvider supplies a real value; consumers must check for null and throw if missing.
 */
export const PluginContext = createContext<PluginContextValue | null>(null);
