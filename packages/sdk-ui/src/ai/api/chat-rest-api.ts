import { HttpClient } from '@sisense/sdk-rest-client';
import type {
  Chat,
  ChatRequest,
  ChatResponse,
  ChatWithoutHistory,
  DataModel,
  GetNlgQueryResultRequest,
  GetNlgQueryResultResponse,
  LlmConfig,
  Perspective,
  QueryRecommendationConfig,
  QueryRecommendationResponse,
} from './types';

export class ChatRestApi {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    if (!httpClient) throw new Error('HttpClient is required.');
    this.httpClient = httpClient;
  }

  public getDataModels = async (): Promise<DataModel[]> => {
    const data: DataModel[] = await this.httpClient.get(`api/v2/datamodels/schema`);
    return data.filter((d) => d);
  };

  public getPerspectives = async (): Promise<Perspective[]> => {
    return this.httpClient.get(`api/v2/perspectives`);
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

  private createChat = async (contextId: string): Promise<Chat> => {
    return this.httpClient.post('api/v2/ai/chats', { contextId });
  };

  private postChat = async (chatId: string, request: ChatRequest): Promise<ChatResponse> => {
    return this.httpClient.post(`api/v2/ai/chats/${chatId}`, request);
  };

  private deleteChatHistory = async (chatId: string) => {
    return this.httpClient.delete(`api/v2/ai/chats/${chatId}/history`);
  };

  ai = {
    getNlgQueryResult: this.getNlgQueryResult,
    getQueryRecommendations: this.getQueryRecommendations,
    setLlmConfig: this.setLlmConfig,
    chat: {
      getAll: this.getAllChats,
      getById: this.getChatById,
      create: this.createChat,
      post: this.postChat,
      clearHistory: this.deleteChatHistory,
    },
  };
}
