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
import { DataSourceField } from '@sisense/sdk-data';

export class ChatRestApi {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public getChatContexts = async () => {
    //TODO: refactor to use getDataSourceList() from sdk-query-client after applying same change there?
    const result = await this.httpClient.get<ChatContext[]>(`api/datasources`);
    return result || [];
  };

  // ==== /v2/ai endpoints ====
  private getNlgQueryResult = (request: GetNlgQueryResultRequest) => {
    return this.httpClient.post<GetNlgQueryResultResponse>('api/v2/ai/nlg/queryResult', request);
  };

  private getQueryRecommendations = (contextTitle: string, config: QueryRecommendationConfig) => {
    return this.httpClient.get<QueryRecommendationResponse>(
      `api/v2/ai/recommendations/query/${contextTitle}/${config.numOfRecommendations}`,
    );
  };

  private setLlmConfig = (config: LlmConfig) => {
    return this.httpClient.post('api/v2/settings/ai/llmProvider', config).catch((e) => {
      console.error('Unable to set llm config', e);
    });
  };

  // ==== /v2/ai/chats endpoints ====
  private getAllChats = () => {
    return this.httpClient.get<ChatWithoutHistory[]>('api/v2/ai/chats');
  };

  private getChatById = (chatId: string) => {
    return this.httpClient.get<Chat>(`api/v2/ai/chats/${chatId}`);
  };

  private createChat = (sourceId: string) => {
    return this.httpClient.post<Chat>('api/v2/ai/chats', { sourceId });
  };

  private postChat = (chatId: string, request: ChatRequest) => {
    return this.httpClient.post<ChatResponse>(`api/v2/ai/chats/${chatId}`, request);
  };

  private deleteChatHistory = (chatId: string) => {
    return this.httpClient.delete(`api/v2/ai/chats/${chatId}/history`);
  };

  private sendFeedback = (request: SendFeedbackRequest) => {
    return this.httpClient.post('api/v2/ai/feedback', request);
  };

  // ==== misc endpoints ====
  private getDataSourceFields = (dataSource: string) => {
    return this.httpClient.post<DataSourceField[]>(
      `api/datasources/${encodeURIComponent(dataSource)}/fields/search`,
      {
        offset: 0,
        count: 9999,
      },
    );
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
