import { createContext } from 'react';
import { PluginComponent, PluginComponentProps } from './types';

type PluginsContextType<T extends PluginComponentProps = PluginComponentProps> = {
  plugins: Map<string, PluginComponent<T>>;
  registerPlugin: <T>(pluginType: string, plugin: PluginComponent<T>) => void;
  getPlugin: (pluginType: string) => PluginComponent<T> | undefined;
};

const map = new Map();

export const PluginsContext = createContext<PluginsContextType>({
  plugins: map,
  registerPlugin: () => {},
  getPlugin: () => undefined,
});
