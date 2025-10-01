import { watchEffect } from 'vue';
import { DataObserver } from '@ethings-os/sdk-ui-preact';
import type { ContextConnector } from '@ethings-os/sdk-ui-preact';
import { CustomAiContextProvider } from '@ethings-os/sdk-ui-preact/ai';
import type { CustomAiContextProviderProps } from '@ethings-os/sdk-ui-preact/ai';
import { getAiContext } from '../../providers';

/**
 * Creates AI context connector
 * @internal
 */
export const createAiContextConnector = (): ContextConnector<CustomAiContextProviderProps> => {
  const aiContext = getAiContext();

  const propsObserver = new DataObserver<CustomAiContextProviderProps>({
    context: aiContext.value,
  });

  watchEffect(() => {
    propsObserver.setValue({
      context: aiContext.value,
    });
  });

  return {
    propsObserver,
    providerComponent: CustomAiContextProvider,
  };
};
