import { defineComponent, provide, ref } from 'vue';

import { customWidgetsContextKey, defaultCustomWidgetsContext } from './custom-widgets-context';

/**
 * Provider for working with custom widgets fetched from an external environment.
 *
 * Provides methods for registering, retrieving, and interacting with custom widgets.
 *
 * @internal
 * @group Contexts
 */
export const CustomWidgetsProvider = defineComponent({
  setup(props, { slots }) {
    provide(customWidgetsContextKey, ref(defaultCustomWidgetsContext));

    return () => {
      return slots.default?.();
    };
  },
});
