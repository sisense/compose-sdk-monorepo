import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Chatbot as ChatbotPreact } from '@sisense/sdk-ui-preact/ai';
import type { ChatbotProps as ChatbotPropsPreact } from '@sisense/sdk-ui-preact/ai';
import { createDefaultContextConnectors, setupHelper } from '../../helpers/setup-helper';
import { createAiContextConnector } from '../helpers/context-connectors';

/**
 * Props of the {@link @sisense/sdk-ui-vue!Chatbot | `Chatbot`} component.
 */
export interface ChatbotProps extends ChatbotPropsPreact {}

/**
 * An Vue component that renders a chatbot with data topic selection.
 *
 * ::: warning Note
 * This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
 * :::
 *
 * @example
 * Here's how you can use the Chatbot component in a Vue application:
 * ```vue
<script setup lang="ts">
import { Chatbot, type ChatbotProps } from '@sisense/sdk-ui-vue/ai';

const chatbotProps: ChatbotProps = {
  width: 500,
  height: 700,
  config: {
    numOfRecommendations: 5,
  },
};
</script>

<template>
  <Chatbot
    :width="chatbotProps.width"
    :height="chatbotProps.height"
    :config="chatbotProps.config"
  />
</template>
 * ```
 *
 * <img src="media://vue-chatbot-example.png" width="500px" />
 *
 * @param props - {@link ChatbotProps}
 * @group Generative AI
 * @beta
 */
export const Chatbot = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ChatbotProps.width}
     */
    width: String as PropType<ChatbotProps['width']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChatbotProps.height}
     */
    height: String as PropType<ChatbotProps['height']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChatbotProps.config}
     */
    config: Object as PropType<ChatbotProps['config']>,
  },
  setup: (props) =>
    setupHelper(ChatbotPreact, props as ChatbotPropsPreact, [
      ...createDefaultContextConnectors(),
      createAiContextConnector(),
    ]),
});
