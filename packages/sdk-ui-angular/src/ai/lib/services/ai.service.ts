import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
  ChatRestApi,
  UseGetNlgInsightsParams,
  prepareGetNlgInsightsPayload,
  GetQueryRecommendationsParams,
  AiContextProviderProps,
  GetNlgInsightsResponse,
  QueryRecommendation,
  GetNlqResultParams,
  DEFAULT_RECOMMENDATIONS_COUNT,
  widgetComposer,
  prepareGetNlqResultPayload,
} from '@sisense/sdk-ui-preact/ai';
// eslint-disable-next-line import/no-extraneous-dependencies
import { SisenseContextService, TrackableService, WidgetProps } from '@sisense/sdk-ui-angular';

export interface AiContextConfig extends Omit<AiContextProviderProps, 'children'> {}
export interface GetNlgInsightsParams extends Omit<UseGetNlgInsightsParams, 'enabled'> {}

/**
 * Token used to inject {@link AiContextConfig} into your application.
 *
 * @example
 * Example of importing {@link SdkAiModule} and injecting {@link AiContextConfig} into your application,
 * along with importing dependency {@link SdkUiModule} and injecting {@link SisenseContextConfig} to connect to a Sisense instance:
 *
 * ```ts
 * import { SdkUiModule, SisenseContextConfig } from '@sisense/sdk-ui-angular';
 * import { SdkAiModule, AI_CONTEXT_CONFIG_TOKEN, AiContextConfig } from '@sisense/sdk-ui-angular/ai';
 *
 * const AI_CONTEXT_CONFIG: AiContextConfig = {
 *   volatile: true,
 * };
 * const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
 *   url: "<instance url>", // replace with the URL of your Sisense instance
 *   token: "<api token>", // replace with the API token of your user account
 *   defaultDataSource: DM.DataSource,
 * };
 *
 * @NgModule({
 *   imports: [
 *     BrowserModule,
 *     SdkUiModule,
 *     SdkAiModule,
 *   ],
 *   declarations: [AppComponent],
 *   providers: [
 *     { provide: AI_CONTEXT_CONFIG_TOKEN, useValue: AI_CONTEXT_CONFIG },
 *     { provide: SISENSE_CONTEXT_CONFIG_TOKEN, useValue: SISENSE_CONTEXT_CONFIG },
 *   ],
 *   bootstrap: [AppComponent],
 * })
 * ```
 *
 * @group Generative AI
 * @beta
 */
export const AI_CONTEXT_CONFIG_TOKEN = new InjectionToken<AiContextConfig>('AI Context Config');

/**
 * Service for working with Sisense Fusion Generative AI.
 *
 * ::: warning Note
 * This service is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
 * :::
 *
 * @group Generative AI
 * @beta
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<AiService>(['getNlgInsights', 'getQueryRecommendations'])
export class AiService {
  private apiPromise: Promise<ChatRestApi>;

  constructor(
    private sisenseContextService: SisenseContextService,
    @Optional() @Inject(AI_CONTEXT_CONFIG_TOKEN) aiContextConfig?: AiContextConfig,
  ) {
    this.apiPromise = this.sisenseContextService
      .getApp()
      .then((app) => new ChatRestApi(app.httpClient, aiContextConfig?.volatile));
  }

  /** @internal */
  getApi(): Promise<ChatRestApi> {
    return this.apiPromise;
  }

  /**
   * Fetches an analysis of the provided query using natural language generation (NLG).
   * Specifying NLG parameters is similar to providing parameters to the {@link QueryService.executeQuery} service method, using dimensions, measures, and filters.
   *
   * @param params - Parameters for getting NLG insights
   * @returns NLG insights text summary
   */
  async getNlgInsights(params: GetNlgInsightsParams): Promise<string | undefined> {
    const api = await this.getApi();
    const payload = prepareGetNlgInsightsPayload(params);
    return api.ai
      .getNlgInsights(payload)
      .then((response?: GetNlgInsightsResponse) => response?.data?.answer);
  }

  /**
   * Fetches recommended questions for a data model or perspective.
   *
   * @param params - Parameters for recommendations
   * @returns An array of objects, each containing recommended question text and its corresponding `widgetProps`
   */
  async getQueryRecommendations(
    params: GetQueryRecommendationsParams,
  ): Promise<QueryRecommendation[]> {
    const api = await this.getApi();
    const { contextTitle, count, enableAxisTitlesInWidgetProps } = params;
    const recCount = count ?? DEFAULT_RECOMMENDATIONS_COUNT;

    const rawRecommendations =
      (await api.ai.getQueryRecommendations(contextTitle, { numOfRecommendations: recCount })) ||
      [];

    return rawRecommendations.map(
      (recommendation: QueryRecommendation) =>
        ({
          ...recommendation,
          widgetProps: recommendation.jaql
            ? widgetComposer.toWidgetProps(recommendation, {
                useCustomizedStyleOptions: enableAxisTitlesInWidgetProps,
              })
            : undefined,
        } as QueryRecommendation),
    );
  }

  /**
   * Executes a natural language query (NLQ) against a data model or perspective
   *
   * @param params - NLQ query parameters
   * @returns The result as WidgetProps
   */
  async getNlqResult(params: GetNlqResultParams): Promise<WidgetProps | undefined> {
    const { contextTitle, request } = prepareGetNlqResultPayload(params);
    const api = await this.getApi();

    const data = await api?.ai.getNlqResult(contextTitle, request);

    return data
      ? widgetComposer.toWidgetProps(data, {
          useCustomizedStyleOptions: params.enableAxisTitlesInWidgetProps || false,
        })
      : undefined;
  }
}
