import { JaqlQueryPayload } from '@sisense/sdk-query-client';

import { ExpandedQueryModel } from '@/analytics-composer';
import { WidgetProps } from '@/props';

export interface ChatContext {
  title: string;
  live: boolean;
}

export interface ChatContextDetails {
  dashboardId?: string;
}
export interface TextMessage {
  role: 'assistant';
  content: string; // stringified json { answer: string }
  type: 'text';
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
export type ChatMessage = RegularMessage | NlqMessage | TextMessage;

export interface Chat {
  chatId: string;
  contextId: string;
  contextTitle: string;
  contextDetails?: ChatContextDetails;
  expireAt: string;
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

/**
 * Response data for NLQ request
 */
export interface NlqResponseData extends ExpandedQueryModel {
  /** Detailed description of the response */
  detailedDescription: string;
  /** An array of suggested followup questions  */
  followupQuestions?: string[];
  /** NLQ prompt used in the request  */
  nlqPrompt: string;
  /** Suggested widget props*/
  widgetProps?: WidgetProps | undefined;
  /** The response message for the chat  */
  userMsg: string;
  /** @internal */
  clarification?: string;
}
export interface NlqResponse {
  data: NlqResponseData;
  timestamp: string;
  responseType: 'nlq';
}
export type ChatResponse = NlqResponse | TextResponse | ErrorResponse;

export interface QueryRecommendationConfig {
  numOfRecommendations: number;
  userPrompt?: string;
}

export type NlqResult = Omit<NlqResponseData, 'followupQuestions'>;

/** AI-generated recommended query you can run on your data model */
export interface QueryRecommendation extends Omit<NlqResponseData, 'followupQuestions'> {}
export type QueryRecommendationResponse = QueryRecommendation[];

export interface GetNlgInsightsRequest {
  jaql: Pick<JaqlQueryPayload, 'datasource' | 'metadata' | 'filterRelations'>;
  verbosity?: 'Low' | 'High';
}

/** @internal */
export interface GetNlgInsightsResponse {
  data?: {
    answer: string;
  };
  responseType: 'Text';
}

/** @internal */
export const NLQ_RESULT_CHART_TYPES = [
  'indicator',
  'column',
  'line',
  'table',
  'pie',
  'bar',
] as const;
/** NLQ result chart types @expandType */
export type NlqResultChartType = (typeof NLQ_RESULT_CHART_TYPES)[number];
export interface GetNlqResultRequest {
  text: string;
  timezone?: string;
  chartTypes: NlqResultChartType[];
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
