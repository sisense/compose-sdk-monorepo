import { ContextConnector, DataObserver } from '@ethings-os/sdk-ui-preact';
import { CustomAiContextProvider, CustomAiContextProviderProps } from '@ethings-os/sdk-ui-preact/ai';

import { AiService } from '../services/ai.service';

/**
 * Creates AI context connector
 *
 * @param aiService - The AI service
 * @internal
 */
export const createAiContextConnector = (
  aiService: AiService,
): ContextConnector<CustomAiContextProviderProps> => {
  const propsObserver = new DataObserver<CustomAiContextProviderProps>();

  aiService
    .getApi()
    .then((api) =>
      propsObserver.setValue({
        context: {
          api,
        },
      }),
    )
    .catch((error) =>
      propsObserver.setValue({
        error,
      }),
    );

  return {
    propsObserver,
    providerComponent: CustomAiContextProvider,
  };
};
