import '../index.css';

export { default as AiContextProvider, type AiContextProviderProps } from './ai-context-provider';
export { type ChatConfig } from './chat-config';
export {
  useGetNlgInsights,
  type UseGetNlgInsightsParams,
  type UseGetNlgInsightsState,
} from './use-get-nlg-insights';
export {
  useGetNlqResult,
  prepareGetNlqResultPayload,
  executeGetNlqResult,
  type ExecuteGetNlqResult,
  type UseGetNlqResultParams,
  type UseGetNlqResultState,
  type GetNlqResultParams,
} from './use-get-nlq-result';
export {
  useGetQueryRecommendations,
  type UseGetQueryRecommendationsParams,
  type GetQueryRecommendationsParams,
  type UseGetQueryRecommendationsState,
  DEFAULT_RECOMMENDATIONS_COUNT,
} from './use-get-query-recommendations';
export { useChatSession, type UseChatSessionResult } from './use-chat-session';
export { useLastNlqResponse } from './use-last-nlq-response';
export { useFinalNlqResponse } from './use-final-nlq-response';
export type {
  GetNlgInsightsRequest,
  GetNlgInsightsResponse,
  QueryRecommendationResponse,
  QueryRecommendation,
  NlqResponseData,
  NlqResult,
  NlqResultChartType,
} from './api/types';
export { NLQ_RESULT_CHART_TYPES } from './api/types';
export { Chatbot, type ChatbotProps } from './chatbot';
export { default as GetNlgInsights, type GetNlgInsightsProps } from './get-nlg-insights';
export { NlqChartWidget, type NlqChartWidgetProps } from './chart/nlq-chart-widget';

export { ChatRestApi } from './api/chat-rest-api';
export {
  CustomAiContextProvider,
  type CustomAiContext,
  type CustomAiContextProviderProps,
} from './custom-ai-context-provider';
export { prepareGetNlgInsightsPayload } from './use-get-nlg-insights';
export {
  getNlgInsightsFromWidget,
  type GetNlgInsightsFromWidgetOptions,
} from './get-nlg-insights-from-widget';
export { widgetComposer } from '@/analytics-composer';
