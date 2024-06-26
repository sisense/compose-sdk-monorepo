import { HttpClient } from '@sisense/sdk-rest-client';
import type {
  Chat,
  ChatRequest,
  ChatResponse,
  ChatWithoutHistory,
  ChatContext,
  GetNlgQueryResultRequest,
  GetNlgQueryResultResponse,
  LlmConfig,
  QueryRecommendationConfig,
  QueryRecommendationResponse,
  SendFeedbackRequest,
} from './types';
import { DataSourceField } from '@sisense/sdk-query-client';

export class ChatRestApi {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    if (!httpClient) throw new Error('HttpClient is required.');
    this.httpClient = httpClient;
  }

  public getChatContexts = (): Promise<ChatContext[]> => {
    return this.httpClient.get(`api/datasources?sharedWith=r,w`);
  };

  // ==== /v2/ai endpoints ====
  private getNlgQueryResult = async (
    request: GetNlgQueryResultRequest,
  ): Promise<GetNlgQueryResultResponse> => {
    return this.httpClient.post('api/v2/ai/nlg/queryResult', request);
  };

  private getQueryRecommendations = async (
    contextTitle: string,
    config: QueryRecommendationConfig,
  ): Promise<QueryRecommendationResponse> => {
    return this.httpClient.get(
      `api/v2/ai/recommendations/query/${contextTitle}/${config.numOfRecommendations}`,
    );
  };

  private setLlmConfig = async (config: LlmConfig) => {
    return this.httpClient.post(`api/v2/settings/ai/llmProvider`, config).catch((e) => {
      console.error('Unable to set llm config', e);
    });
  };

  // ==== /v2/ai/chats endpoints ====
  private getAllChats = async (): Promise<ChatWithoutHistory[]> => {
    return this.httpClient.get(`api/v2/ai/chats`);
  };

  private getChatById = async (chatId: string): Promise<Chat> => {
    return this.httpClient.get(`api/v2/ai/chats/${chatId}`);
  };

  private createChat = async (sourceId: string): Promise<Chat> => {
    return this.httpClient.post('api/v2/ai/chats', { sourceId });
  };

  private postChat = async (chatId: string, request: ChatRequest): Promise<ChatResponse> => {
    return this.httpClient.post(`api/v2/ai/chats/${chatId}`, request);
  };

  private deleteChatHistory = async (chatId: string) => {
    return this.httpClient.delete(`api/v2/ai/chats/${chatId}/history`);
  };

  private sendFeedback = async (request: SendFeedbackRequest) => {
    return this.httpClient.post('api/v2/ai/feedback', request);
  };

  // ==== misc endpoints ====
  private getDataSourceFields = async (dataSource: string): Promise<DataSourceField[]> => {
    return this.httpClient.post(`api/datasources/${encodeURIComponent(dataSource)}/fields/search`, {
      offset: 0,
      count: 9999,
    });
  };

  ai = {
    getNlgQueryResult: this.getNlgQueryResult,
    getQueryRecommendations: this.getQueryRecommendations,
    setLlmConfig: this.setLlmConfig,
    sendFeedback: this.sendFeedback,
    getDataSourceFields: this.getDataSourceFields,
    chat: {
      getAll: this.getAllChats,
      getById: this.getChatById,
      create: this.createChat,
      post: this.postChat,
      clearHistory: this.deleteChatHistory,
    },
  };
}
