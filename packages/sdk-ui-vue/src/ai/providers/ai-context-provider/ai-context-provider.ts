import { defineComponent, provide, ref, watchEffect } from 'vue';
import type { PropType, Ref } from 'vue';
import type { AiContextProviderProps as AiContextProviderPropsPreact } from '@ethings-os/sdk-ui-preact/ai';
import { ChatRestApi, type CustomAiContext } from '@ethings-os/sdk-ui-preact/ai';
import { getSisenseContext } from '../../../providers';
import { aiContextKey, defaultAiContext } from './ai-context';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!AiContextProvider | `AiContextProvider`} component.
 */
export interface AiContextProviderProps extends Omit<AiContextProviderPropsPreact, 'children'> {}

/**
 * A Vue component that wraps all generative AI components and hooks.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { SisenseContextProvider } from '@ethings-os/sdk-ui-vue';
import { AiContextProvider, Chatbot } from '@ethings-os/sdk-ui-vue/ai';
</script>

<template>
  <SisenseContextProvider v-bind="sisenseContextProps">
    <AiContextProvider>
      <Chatbot />
    </AiContextProvider>
  </SisenseContextProvider>
</template>
 * ```
 * @param props - {@link AiContextProviderProps}
 * @group Generative AI
 */
export const AiContextProvider = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AiContextProviderProps.volatile}
     */
    volatile: Boolean as PropType<AiContextProviderProps['volatile']>,
  },

  setup(props, { slots }) {
    const sisenseContext = getSisenseContext();

    const aiContext = ref<CustomAiContext>(defaultAiContext);

    const { app } = sisenseContext.value;
    if (app) {
      aiContext.value = {
        api: new ChatRestApi(app.httpClient, props.volatile),
      };
    }

    watchEffect(async () => {
      const { app } = sisenseContext.value;
      if (app) {
        aiContext.value = {
          api: new ChatRestApi(app.httpClient, props.volatile),
        };
      }
    });

    provide(aiContextKey, aiContext as Ref<CustomAiContext>);

    return () => {
      return slots.default?.();
    };
  },
});
