/* eslint-disable max-lines */
import { withTracking } from '@/decorators/hook-decorators';
import { useQuery } from '@tanstack/react-query';

import { useChatApi } from './api/chat-api-provider';
import { useChatConfig } from './chat-config';

/**
 * Parameters for {@link useGetQueryRecommendations} hook.
 */
export interface UseGetQueryRecommendationsParams {
  /** Data model title or perspective title */
  contextTitle: string;

  /**
   * Number of recommendations that should be returned
   *
   * If not specified, the default value is `4`
   */
  count?: number;
}

export const useGetQueryRecommendationsInternal = (params: UseGetQueryRecommendationsParams) => {
  const { contextTitle, count } = params;

  const api = useChatApi();
  const { numOfRecommendations } = useChatConfig();

  const { data, isLoading } = useQuery({
    queryKey: ['getQueryRecommendations', contextTitle, api],
    queryFn: () =>
      api?.ai.getQueryRecommendations(contextTitle, {
        numOfRecommendations: count ?? numOfRecommendations,
      }),
    enabled: !!api,
  });

  return { data: data ?? [], isLoading };
};

/**
 * React hook that fetches recommended questions for a data model or perspective.
 *
 * This hook includes the same code that fetches the initial suggested questions in the chatbot.
 *
 * ::: warning Note
 * This hook is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
 * :::
 *
 * @example
 * ```tsx
 * import { SisenseContextProvider } from '@sisense/sdk-ui';
 * import { AiContextProvider, useGetQueryRecommendations } from '@sisense/sdk-ui/ai';
 *
 * function Page() {
 *   const { data } = useGetQueryRecommendations({
 *     contextTitle: 'Sample ECommerce',
 *   });
 *
 *   if (!data) {
 *     return <div>Loading recommendations</div>;
 *   }
 *
 *   return (
 *     <ul>
 *       {data.map((item, index) => (
 *         <li key={index}>{item.nlqPrompt}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 *
 * function App() {
 *   return (
 *     <SisenseContextProvider {...sisenseContextProps}>
 *       <AiContextProvider>
 *         <Page />
 *       </AiContextProvider>
 *     </SisenseContextProvider>
 *   );
 * }
 * ```
 * @param params - {@link UseGetQueryRecommendationsParams}
 * @returns An array of objects, each containing recommended question text and its corresponding JAQL
 * @beta
 */
export const useGetQueryRecommendations = withTracking('useGetQueryRecommendations')(
  useGetQueryRecommendationsInternal,
);
