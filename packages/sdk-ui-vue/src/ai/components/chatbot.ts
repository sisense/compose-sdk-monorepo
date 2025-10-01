import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Chatbot as ChatbotPreact } from '@ethings-os/sdk-ui-preact/ai';
import type { ChatbotProps as ChatbotPropsPreact } from '@ethings-os/sdk-ui-preact/ai';
import { createDefaultContextConnectors, setupHelper } from '../../helpers/setup-helper';
import { createAiContextConnector } from '../helpers/context-connectors';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!Chatbot | `Chatbot`} component.
 */
export interface ChatbotProps extends ChatbotPropsPreact {}

/**
 * An Vue component that renders a chatbot with data topic selection.
 *
 * @example
 * Here's how you can use the Chatbot component in a Vue application:
 * ```vue
<script setup lang="ts">
import { Chatbot, type ChatbotProps } from '@ethings-os/sdk-ui-vue/ai';

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
 */
export const Chatbot = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChatbotProps.width}
     */
    width: [String, Number] as PropType<ChatbotProps['width']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChatbotProps.height}
     */
    height: [String, Number] as PropType<ChatbotProps['height']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChatbotProps.config}
     */
    config: Object as PropType<ChatbotProps['config']>,
  },
  setup: (props) =>
    setupHelper(ChatbotPreact, props, [
      ...createDefaultContextConnectors(),
      createAiContextConnector(),
    ]),
});
