import { JaqlQueryPayload, MetadataItem } from '@sisense/sdk-query-client';
import { ChartDataOptions } from '../../types';

export interface ChatContext {
  title: string;
  live: boolean;
}

export interface NlqMessage {
  role: 'assistant';
  content: string; // stringified json
  type: 'nlq';
}
interface RegularMessage {
  role: 'user' | 'assistant';
  content: string;
}
export type ChatMessage = RegularMessage | NlqMessage;

export interface Chat {
  chatId: string;
  contextId: string;
  contextTitle: string;
  lastUpdate: string;
  tenantId: string;
  userId: string;
  chatHistory: ChatMessage[];
}
export type ChatWithoutHistory = Omit<Chat, 'chatHistory'>;

export interface LlmConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  version?: string;
}

export interface ChatRequest {
  text?: string;
  timezone?: string;
  options?: {
    enableFollowup?: boolean;
  };
}

interface TextResponse {
  chatHistory: ChatMessage[];
  data: {
    answer: string;
  };
  chatId: string;
  responseType: 'text';
}

interface ErrorResponse {
  data: {
    message: string;
    code: string;
    answer: string;
  };
  responseType: 'error';
}

export type KeysOfUnion<T> = T extends T ? keyof T : never;
export type AllPossibleChartOptionKeys = KeysOfUnion<ChartDataOptions>;
export type AxesMappingKey = Exclude<AllPossibleChartOptionKeys, 'seriesToColorMap'>;
export type AxesMapping = Partial<
  Record<
    AxesMappingKey,
    Array<{
      name: string;
      type?: string;
    }>
  >
>;

export interface ChartRecommendations {
  chartFamily: string;
  chartType: string;
  axesMapping: AxesMapping;
}
export interface NlqResponseData {
  detailedDescription: string;
  followupQuestions: string[];
  nlqPrompt: string;
  chartRecommendations: ChartRecommendations | {};
  jaql: {
    datasource: {
      title: string;
    };
    metadata: MetadataItem[];
  };
  queryTitle: string;
}
export interface NlqResponse {
  data: NlqResponseData;
  timestamp: string;
  responseType: 'nlq';
}
export type ChatResponse = NlqResponse | TextResponse | ErrorResponse;

export interface QueryRecommendationConfig {
  numOfRecommendations: number;
}

export type QueryRecommendation = Omit<NlqResponseData, 'followupQuestions'>;
export type QueryRecommendationResponse = QueryRecommendation[];

export interface GetNlgQueryResultRequest {
  jaql: Pick<JaqlQueryPayload, 'datasource' | 'metadata' | 'filterRelations'>;
}

export interface GetNlgQueryResultResponse {
  data?: {
    answer: string;
  };
  responseType: 'Text';
}

export interface SendFeedbackRequest {
  type: string;
  data: object;
  sourceId: string;
  rating: -1 | 1;
}

/**
 * The chat mode to use for a chat session
 *
 * analyze: Enable business users to uncover data insights
 * develop: Enable developers to build queries and charts for embedded analytics
 */
export type ChatMode = 'analyze' | 'develop';
