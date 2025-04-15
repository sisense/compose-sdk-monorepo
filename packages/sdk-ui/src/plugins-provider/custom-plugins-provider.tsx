import { PropsWithChildren } from 'react';
import { PluginsContext } from './plugins-context';
import { PluginComponent, PluginComponentProps } from './types';
import { CustomContextProviderProps } from '../types';

/** @internal */
export type CustomPluginsProviderProps = CustomContextProviderProps<
  CustomPluginsContext<PluginComponentProps>
>;

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
export const CustomPluginsProvider: React.FC<PropsWithChildren<CustomPluginsProviderProps>> = (
  props,
) => {
  const { error, context, children } = props;

  if (error) {
    throw error;
  }

  const { pluginMap, registerPlugin, getPlugin } = context as CustomPluginsContext<any>;

  return (
    <PluginsContext.Provider value={{ registerPlugin, getPlugin, plugins: pluginMap }}>
      {children}
    </PluginsContext.Provider>
  );
};
