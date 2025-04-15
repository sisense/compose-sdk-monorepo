import { defineComponent, provide, ref } from 'vue';
import { defaultPluginsContext, pluginsContextKey } from './plugins-context';

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
