import { defineComponent, inject, provide, ref, watchEffect } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import type { CustomPluginsContext } from '@sisense/sdk-ui-preact';
import { createContextProviderRenderer, CustomPluginsProvider } from '@sisense/sdk-ui-preact';

const pluginsContextKey = Symbol('pluginsContextKey') as InjectionKey<Ref<CustomPluginsContext>>;

const defaultPluginsContext: CustomPluginsContext = {
  pluginMap: new Map(),
  registerPlugin: (pluginType: string, plugin: any) => {
    if (!defaultPluginsContext.pluginMap.has(pluginType)) {
      defaultPluginsContext.pluginMap.set(pluginType, plugin);
    }
  },
  getPlugin: (pluginType: string) => defaultPluginsContext.pluginMap.get(pluginType),
};

/**
 * Gets Plugins context
 *
 * @group Contexts
 */
export const getPluginsContext = () => {
  return inject(pluginsContextKey, ref(defaultPluginsContext));
};

/**
 * Creates plugins context connector
 *
 * @group Contexts
 * @internal
 */
export const createPluginsContextConnector = (context: CustomPluginsContext) => {
  return {
    async prepareContext() {
      return context;
    },
    renderContextProvider: createContextProviderRenderer(CustomPluginsProvider),
  };
};

/**
 * Provider for working with plugins fetched from an external environment.
 *
 * Provides methods for registering, retrieving, and interacting with plugins.
 *
 * @internal
 * @group Contexts
 */
export const PluginsProvider = defineComponent({
  setup(props, { slots }) {
    provide(pluginsContextKey, ref(defaultPluginsContext));

    return () => {
      return slots.default?.();
    };
  },
});
