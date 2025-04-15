import { inject, ref } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import type { CustomSisenseContext } from '@sisense/sdk-ui-preact';

export const defaultSisenseContext: CustomSisenseContext = {
  isInitialized: false,
  app: undefined,
  tracking: {
    enabled: true,
    packageName: 'sdk-ui-vue',
  },
  errorBoundary: {
    showErrorBox: true,
  },
};

export const sisenseContextKey = Symbol('sisenseContextKey') as InjectionKey<
  Ref<CustomSisenseContext>
>;

/**
 * Gets sisense context
 * @internal
 */
export const getSisenseContext = (): Ref<CustomSisenseContext> => {
  const treatDefaultAsFactory = true;
  return inject(
    sisenseContextKey,
    () => ref(defaultSisenseContext) as Ref<CustomSisenseContext>,
    treatDefaultAsFactory,
  );
};
