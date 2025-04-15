import { getPluginsContext } from '../providers/plugins-provider';

/**
 * @internal
 */
export const usePlugins = () => {
  const context = getPluginsContext();
  return context.value;
};
