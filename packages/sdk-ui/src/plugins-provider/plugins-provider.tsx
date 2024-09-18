import { ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { PluginsContext } from './plugins-context';
import { WidgetPlugin } from './types';

/**
 * Plugin Provider component that allows registering and accessing plugins.
 *
 * @internal
 */
export const PluginsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pluginMapRef = useRef(new Map<string, WidgetPlugin>());

  const registerPlugin = useCallback((pluginType: string, plugin: WidgetPlugin) => {
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

export const usePlugins = () => useContext(PluginsContext);
