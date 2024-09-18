import { createContext } from 'react';
import { WidgetPlugin } from './types';

type PluginsContextType = {
  plugins: Map<string, WidgetPlugin>;
  registerPlugin: (pluginType: string, plugin: WidgetPlugin) => void;
  getPlugin: (pluginType: string) => WidgetPlugin | undefined;
};

const map = new Map();

export const PluginsContext = createContext<PluginsContextType>({
  plugins: map,
  registerPlugin: () => {},
  getPlugin: () => undefined,
});
