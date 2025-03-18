import { ReactNode } from 'react';
import { PluginsContext } from './plugins-context';
import { PluginComponent, PluginComponentProps } from './types';

/** @internal */
export type CustomPluginsProviderProps<T = PluginComponentProps> = {
  context: CustomPluginsContext<T>;
  error?: Error;
};

/** @internal */
export type CustomPluginsContext<T = PluginComponentProps> = {
  pluginMap: Map<string, PluginComponent<T>>;
  registerPlugin: (pluginType: string, plugin: PluginComponent<T>) => void;
  getPlugin: (pluginType: string) => PluginComponent<T> | undefined;
};

/**
 * Custom Plugin Provider component that allows passing external plugins context.
 *
 * Note: it is designed to serve as a bridge for passing pre-initialized plugin data between an external wrapper and child React components.
 *
 * @internal
 */
export const CustomPluginsProvider: React.FC<{
  context: CustomPluginsContext<any>;
  children: ReactNode;
}> = ({ context, children }) => {
  const { pluginMap, registerPlugin, getPlugin } = context;

  return (
    <PluginsContext.Provider value={{ registerPlugin, getPlugin, plugins: pluginMap }}>
      {children}
    </PluginsContext.Provider>
  );
};
