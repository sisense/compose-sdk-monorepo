import { MetadataItem } from '@sisense/sdk-query-client';
import { ChartDataOptions } from '../../types';

export interface ChatContext {
  id: string;
  name: string;
  type: ChatContextType;
  description: string;
}

export type ChatContextType = 'dashboard' | 'datamodel' | 'global' | 'perspective';

interface TextMessage {
  role: 'assistant';
  content: string; // stringified json
  type: 'Text';
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
type SystemMessage = NlqMessage | TextMessage;
export type ChatMessage = RegularMessage | SystemMessage;

export interface Chat {
  chatId: string;
  contextId: string;
  contextType: ChatContextType;
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
  responseType: 'Text';
}

type KeysOfUnion<T> = T extends T ? keyof T : never;
type AllPossibleChartOptionKeys = KeysOfUnion<ChartDataOptions>;
type AxesMappingKey = Exclude<AllPossibleChartOptionKeys, 'seriesToColorMap'>;
export type AxesMapping = Partial<
  Record<
    AxesMappingKey,
    Array<{
      name: string;
      type: string;
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
  chartRecommendations: ChartRecommendations;
  jaql: {
    datasource?: {
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
export type ChatResponse = NlqResponse | TextResponse;

export interface QueryRecommendationConfig {
  numOfRecommendations: number;
}

export interface QueryRecommendation {
  nlqPrompt: string;
  chartRecommendations: ChartRecommendations;
  jaql: {
    datasource?: {
      title: string;
    };
    metadata: MetadataItem[];
  };
  queryTitle: string;
  detailedDescription: string;
}
export type QueryRecommendationResponse = QueryRecommendation[];

export interface DataModel {
  oid: string;
  title: string;
}

export interface Perspective {
  _id: string;
  oid: string;
  datamodelOid: string;
  description: string;
  tables: any[]; // You can replace 'any' with a more specific type if needed
  lastUpdated: string;
  createdTime: string;
  parentOid: string | null;
  name: string;
  creator: string;
  isDefault: boolean;
  tenantId: string;
}

export interface GetNlgQueryResultRequest {
  style: 'Small' | 'Medium' | 'Large';
  jaql: {
    datasource: {
      title: string;
    };
    metadata: unknown[];
  };
}

export interface GetNlgQueryResultResponse {
  data?: {
    answer: string;
  };
  responseType: 'Text';
}
