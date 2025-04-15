import { inject, ref } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import type { CustomPluginsContext } from '@sisense/sdk-ui-preact';

export const defaultPluginsContext: CustomPluginsContext = {
  pluginMap: new Map(),
  registerPlugin: (pluginType: string, plugin: any) => {
    if (!defaultPluginsContext.pluginMap.has(pluginType)) {
      defaultPluginsContext.pluginMap.set(pluginType, plugin);
    }
  },
  getPlugin: (pluginType: string) => defaultPluginsContext.pluginMap.get(pluginType),
};

export const pluginsContextKey = Symbol('pluginsContextKey') as InjectionKey<
  Ref<CustomPluginsContext>
>;

/**
 * Gets Plugins context
 *
 * @group Contexts
 */
export const getPluginsContext = (): Ref<CustomPluginsContext> => {
  const treatDefaultAsFactory = true;
  return inject(pluginsContextKey, () => ref(defaultPluginsContext), treatDefaultAsFactory);
};
