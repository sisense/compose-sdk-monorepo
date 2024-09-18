import { ReactNode } from 'react';
import { PluginsContext } from './plugins-context';
import { WidgetPlugin } from './types';

/** @internal */
export type CustomPluginsProviderProps = {
  context: CustomPluginsContext;
  error?: Error;
};

/** @internal */
export type CustomPluginsContext = {
  pluginMap: Map<string, WidgetPlugin>;
  registerPlugin: (pluginType: string, plugin: WidgetPlugin) => void;
  getPlugin: (pluginType: string) => WidgetPlugin | undefined;
};

/**
 * Custom Plugin Provider component that allows passing external plugins context.
 *
 * Note: it is designed to serve as a bridge for passing pre-initialized plugin data between an external wrapper and child React components.
 *
 * @internal
 */
export const CustomPluginsProvider: React.FC<{
  context: CustomPluginsContext;
  children: ReactNode;
}> = ({ context, children }) => {
  const { pluginMap, registerPlugin, getPlugin } = context;

  return (
    <PluginsContext.Provider value={{ registerPlugin, getPlugin, plugins: pluginMap }}>
      {children}
    </PluginsContext.Provider>
  );
};
