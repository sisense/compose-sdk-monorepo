import { ContextConnector, createContextProviderRenderer } from '@sisense/sdk-ui-preact';
import { CustomAiContextProvider, CustomAiContext } from '@sisense/sdk-ui-preact/ai';
import { AiService } from '../services/ai.service';

/**
 * Creates AI context connector
 *
 * @param aiService - The AI service
 * @internal
 */
export const createAiContextConnector = (
  aiService: AiService,
): ContextConnector<CustomAiContext> => {
  return {
    async prepareContext() {
      const api = await aiService.getApi();
      return {
        api,
      };
    },
    renderContextProvider: createContextProviderRenderer(CustomAiContextProvider),
  };
};
