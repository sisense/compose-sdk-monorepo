import { inject, ref } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import type { CustomAiContext } from '@ethings-os/sdk-ui-preact/ai';

export const defaultAiContext: Partial<CustomAiContext> = {
  api: undefined,
};

export const aiContextKey = Symbol('aiContextKey') as InjectionKey<Ref<CustomAiContext>>;

/**
 * Gets AI context
 * @internal
 */
export const getAiContext = () => {
  const treatDefaultAsFactory = true;
  return inject(
    aiContextKey,
    () => ref(defaultAiContext),
    treatDefaultAsFactory,
  ) as Ref<CustomAiContext>;
};
