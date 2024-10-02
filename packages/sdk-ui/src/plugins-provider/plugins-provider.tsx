import { ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { PluginsContext } from './plugins-context';
import { PluginComponent } from './types';

/**
 * Plugin Provider component that allows registering and accessing plugins.
 *
 * @internal
 */
export const PluginsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pluginMapRef = useRef(new Map<string, PluginComponent>());

  const registerPlugin = useCallback((pluginType: string, plugin: PluginComponent) => {
    if (!pluginMapRef.current.has(pluginType)) {
      pluginMapRef.current.set(pluginType, plugin);
    }
  }, []);

  const getPlugin = useCallback((pluginType: string) => {
    return pluginMapRef.current.get(pluginType);
  }, []);

  const plugins = useMemo(() => pluginMapRef.current, []);

  return (
    <PluginsContext.Provider value={{ registerPlugin, getPlugin, plugins }}>
      {children}
    </PluginsContext.Provider>
  );
};

/**
 * @internal
 */
export const usePlugins = () => useContext(PluginsContext);
