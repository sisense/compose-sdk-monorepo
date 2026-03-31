import { type ReactNode, useMemo } from 'react';

import { TabberButtonsWidget } from '@/domains/widgets/components/tabber-buttons-widget';

import { PluginContext } from './plugin-context.js';
import { Plugin } from './types.js';
import { getValidPlugins } from './validate-plugins.js';
import type { CustomVisualization, WidgetPlugin } from './widget-plugins/types.js';
import { WidgetPluginRegistry } from './widget-plugins/widget-plugin-registry.js';

/**
 * Props for PluginProvider component
 *
 * @sisenseInternal
 */
export interface PluginProviderProps {
  /**
   * Array of plugins to register
   */
  plugins: Plugin[];

  /**
   * Child components
   */
  children: ReactNode;
}

/**
 * Plugin Provider component that validates and provides access to plugins
 *
 * @sisenseInternal
 */
export const PluginProvider: React.FC<PluginProviderProps> = ({ plugins, children }) => {
  const validPlugins = useMemo(() => getValidPlugins(plugins, __PACKAGE_VERSION__), [plugins]);
  const widgetPlugins = useMemo(
    () => validPlugins.filter((plugin): plugin is WidgetPlugin => plugin.pluginType === 'widget'),
    [validPlugins],
  );

  const widgetRegistry = useMemo(() => {
    const registry = new WidgetPluginRegistry();

    // 1. Register built-in widgets
    registry.register('tabber-buttons', TabberButtonsWidget as CustomVisualization, 'plugin');

    // 2. Register declarative plugin widgets
    widgetPlugins.forEach((plugin) => {
      if (plugin.customWidget) {
        registry.register(
          plugin.customWidget.name,
          plugin.customWidget.visualization.Component,
          'plugin',
        );
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
