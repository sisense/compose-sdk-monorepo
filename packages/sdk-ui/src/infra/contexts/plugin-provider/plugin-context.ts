import { createContext } from 'react';

import { Plugin } from './types';

/**
 * Context for accessing registered plugins
 */
export interface PluginContextValue {
  /**
   * Array of validated and loaded plugins
   */
  plugins: readonly Plugin[];
}

/**
 * React context for plugin management
 */
export const PluginContext = createContext<PluginContextValue>({
  plugins: [],
});
