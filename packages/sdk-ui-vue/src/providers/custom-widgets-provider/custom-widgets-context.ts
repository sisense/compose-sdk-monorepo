import { inject, ref } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import type { CustomWidgetsContextAdapter, CustomWidgetComponent } from '@ethings-os/sdk-ui-preact';

export const defaultCustomWidgetsContext = {
  customWidgetsMap: new Map<string, CustomWidgetComponent<any>>(),
};

export const customWidgetsContextKey = Symbol('customWidgetsContextKey') as InjectionKey<
  Ref<CustomWidgetsContextAdapter>
>;

/**
 * Gets Custom Widgets context
 *
 * @group Contexts
 */
export const getCustomWidgetsContext = (): Ref<CustomWidgetsContextAdapter> => {
  const treatDefaultAsFactory = true;
  return inject(
    customWidgetsContextKey,
    () => ref(defaultCustomWidgetsContext),
    treatDefaultAsFactory,
  );
};
