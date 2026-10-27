import { type ReactNode, useMemo } from 'react';

import { WidgetDefinitionRegistry } from '@/domains/widgets/widget-definitions';

import { PluginContext } from './plugin-context.js';
import type { Plugin } from './types.js';
import { getValidPlugins } from './validate-plugins.js';
import { toWidgetDefinition } from './widget-plugins/to-widget-definition.js';
import type { AnyWidgetPlugin } from './widget-plugins/types.js';

/**
 * Shared empty plugins list used as the default when no plugins are passed.
 * A stable reference keeps `PluginProvider`'s memoized registry and context value
 * from being re-created on every render.
 *
 * @internal
 */
export const EMPTY_PLUGINS = Object.freeze<Plugin[]>([]) as Plugin[];

/**
 * Props for PluginProvider component.
 *
 * @sisenseInternal
 */
export interface PluginProviderProps {
  /**
   * Array of plugins to register.
   */
  plugins: Plugin[];

  /**
   * Child components.
   */
  children: ReactNode;
}

/**
 * Plugin Provider component that validates and provides access to plugins.
 *
 * @sisenseInternal
 */
export const PluginProvider: React.FC<PluginProviderProps> = ({ plugins, children }) => {
  const validPlugins = useMemo(() => getValidPlugins(plugins, __PACKAGE_VERSION__), [plugins]);
  const widgetPlugins = useMemo(
    () =>
      validPlugins.filter((plugin): plugin is AnyWidgetPlugin => plugin.pluginType === 'widget'),
    [validPlugins],
  );

  const widgetRegistry = useMemo(() => {
    // Built-in widgets (the tabber) are static definitions the registry reads first.
    const registry = new WidgetDefinitionRegistry();

    widgetPlugins.forEach((plugin) => {
      if (plugin.customWidget) {
        registry.register(toWidgetDefinition(plugin.customWidget, plugin.name), 'plugin');
      }
    });

    return registry;
  }, [widgetPlugins]);

  const contextValue = useMemo(
    () => ({ widgetPlugins, widgetRegistry }),
    [widgetPlugins, widgetRegistry],
  );

  return <PluginContext.Provider value={contextValue}>{children}</PluginContext.Provider>;
};
