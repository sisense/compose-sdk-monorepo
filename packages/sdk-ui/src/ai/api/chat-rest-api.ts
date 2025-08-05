import { HttpClient } from '@sisense/sdk-rest-client';
import type {
  Chat,
  ChatRequest,
  ChatResponse,
  ChatWithoutHistory,
  ChatContext,
  GetNlgInsightsRequest,
  GetNlgInsightsResponse,
  LlmConfig,
  QueryRecommendationConfig,
  QueryRecommendationResponse,
  SendFeedbackRequest,
  GetNlqResultRequest,
  NlqResult,
} from './types';
import { ChatContextDetails } from '@/ai/api/types';

/** @internal */
export class ChatRestApi {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient, private readonly volatile = false) {
    this.httpClient = httpClient;
  }

  public getChatContexts = async () => {
    //TODO: refactor to use getDataSourceList() from sdk-query-client after applying same change there?
    //INFO: trailing slash after /datasources is needed for REST API otherwise ALL tenants models are returned instead of current tenant
    const result = await this.httpClient.get<ChatContext[]>(`api/datasources//`);
    return result || [];
  };

  // ==== /v2/ai endpoints ====
  private getNlgInsights = (request: GetNlgInsightsRequest) => {
    return this.httpClient.post<GetNlgInsightsResponse>('api/v2/ai/nlg/queryResult', request);
  };

  private getQueryRecommendations = (contextTitle: string, config: QueryRecommendationConfig) => {
    return this.httpClient.get<QueryRecommendationResponse>(
      `api/v2/ai/recommendations/query/${contextTitle}/${config.numOfRecommendations}${
        config.userPrompt ? '?userPrompt=' + encodeURIComponent(config.userPrompt) : ''
      }`,
    );
  };

  private getNlqResult = (contextTitle: string, request: GetNlqResultRequest) => {
    return this.httpClient.post<NlqResult>(`api/v2/ai/nlq/query/${contextTitle}`, request);
  };

  private setLlmConfig = (config: LlmConfig) => {
    return this.httpClient.post('api/v2/settings/ai/llmProvider', config).catch((e) => {
      console.error('Unable to set llm config', e);
    });
  };

  // ==== /v2/ai/chats endpoints ====
  private getAllChats = async () => {
    return this.volatile ? [] : this.httpClient.get<ChatWithoutHistory[]>('api/v2/ai/chats');
  };

  private getChatById = (chatId: string) => {
    return this.httpClient.get<Chat>(`api/v2/ai/chats/${chatId}`);
  };

  private createChat = (sourceId: string, contextDetails?: ChatContextDetails) => {
    return this.httpClient.post<Chat>('api/v2/ai/chats', {
      sourceId,
      volatile: this.volatile,
      contextDetails,
    });
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

  ai = {
    getNlgInsights: this.getNlgInsights,
    getNlqResult: this.getNlqResult,
    getQueryRecommendations: this.getQueryRecommendations,
    setLlmConfig: this.setLlmConfig,
    sendFeedback: this.sendFeedback,
    chat: {
      getAll: this.getAllChats,
      getById: this.getChatById,
      create: this.createChat,
      post: this.postChat,
      clearHistory: this.deleteChatHistory,
    },
  };
}
