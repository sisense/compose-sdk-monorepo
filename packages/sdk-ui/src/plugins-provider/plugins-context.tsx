import { createContext } from 'react';
import { PluginComponent } from './types';

type PluginsContextType = {
  plugins: Map<string, PluginComponent>;
  registerPlugin: (pluginType: string, plugin: PluginComponent) => void;
  getPlugin: (pluginType: string) => PluginComponent | undefined;
};

const map = new Map();

export const PluginsContext = createContext<PluginsContextType>({
  plugins: map,
  registerPlugin: () => {},
  getPlugin: () => undefined,
});
