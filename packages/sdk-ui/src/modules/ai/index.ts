import '../../index.css';

export {
  default as AiContextProvider,
  type AiContextProviderProps,
} from './ai-context-provider.js';
export { type ChatConfig } from './chat-config.js';
export {
  useGetNlgInsights,
  type UseGetNlgInsightsParams,
  type UseGetNlgInsightsState,
} from './use-get-nlg-insights.js';
export {
  useGetNlqResult,
  prepareGetNlqResultPayload,
  executeGetNlqResult,
  type ExecuteGetNlqResult,
  type UseGetNlqResultParams,
  type UseGetNlqResultState,
  type GetNlqResultParams,
} from './use-get-nlq-result.js';
export {
  useGetQueryRecommendations,
  type UseGetQueryRecommendationsParams,
  type GetQueryRecommendationsParams,
  type UseGetQueryRecommendationsState,
  DEFAULT_RECOMMENDATIONS_COUNT,
} from './use-get-query-recommendations.js';
export { useChatSession, type UseChatSessionResult } from './use-chat-session.js';
export { useLastNlqResponse } from './use-last-nlq-response.js';
export { useFinalNlqResponse } from './use-final-nlq-response.js';
export type {
  GetNlgInsightsRequest,
  GetNlgInsightsResponse,
  QueryRecommendationResponse,
  QueryRecommendation,
  NlqResponseData,
  NlqResult,
  NlqResultChartType,
} from './api/types.js';
export { NLQ_RESULT_CHART_TYPES } from './api/types.js';
export { Chatbot, type ChatbotProps } from './chatbot.js';
export { default as GetNlgInsights, type GetNlgInsightsProps } from './get-nlg-insights.js';
export { NlqChartWidget, type NlqChartWidgetProps } from './chart/nlq-chart-widget.js';

export { ChatRestApi } from './api/chat-rest-api.js';
export {
  CustomAiContextProvider,
  type CustomAiContext,
  type CustomAiContextProviderProps,
} from './custom-ai-context-provider.js';
export { prepareGetNlgInsightsPayload } from './use-get-nlg-insights.js';
export {
  getNlgInsightsFromWidget,
  type GetNlgInsightsFromWidgetOptions,
} from './get-nlg-insights-from-widget.js';
export { widgetComposer } from '@/modules/analytics-composer';
