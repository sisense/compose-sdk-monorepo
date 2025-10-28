import {
  type CustomWidgetComponent,
  type CustomWidgetsContextAdapter,
  TabberButtonsWidget,
} from '@sisense/sdk-ui-preact';
import { inject, ref } from 'vue';
import type { InjectionKey, Ref } from 'vue';

export const defaultCustomWidgetsContext = {
  customWidgetsMap: new Map<string, CustomWidgetComponent<any>>([
    ['tabber-buttons', TabberButtonsWidget],
  ]),
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
