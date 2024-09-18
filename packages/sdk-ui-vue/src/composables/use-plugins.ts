import { getPluginsContext } from '../providers/plugins-provider.js';

/**
 * @internal
 */
export const usePlugins = () => {
  const context = getPluginsContext();
  return context.value;
};
