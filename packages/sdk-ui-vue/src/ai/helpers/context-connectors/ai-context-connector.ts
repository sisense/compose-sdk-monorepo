import { DataObserver } from '@sisense/sdk-ui-preact';
import type { ContextConnector } from '@sisense/sdk-ui-preact';
import { CustomAiContextProvider } from '@sisense/sdk-ui-preact/ai';
import type { CustomAiContextProviderProps } from '@sisense/sdk-ui-preact/ai';
import { watchEffect } from 'vue';

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
