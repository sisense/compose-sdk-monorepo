import { type ReactNode, useMemo } from 'react';

import { PluginContext } from './plugin-context';
import { Plugin } from './types';
import { getValidPlugins } from './validate-plugins';

/**
 * Props for PluginProvider component
 *
 * @internal
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
 */
export const PluginProvider: React.FC<PluginProviderProps> = ({ plugins, children }) => {
  const validPlugins = useMemo(() => getValidPlugins(plugins, __PACKAGE_VERSION__), [plugins]);

  const contextValue = useMemo(
    () => ({
      plugins: validPlugins,
    }),
    [validPlugins],
  );

  return <PluginContext.Provider value={contextValue}>{children}</PluginContext.Provider>;
};
